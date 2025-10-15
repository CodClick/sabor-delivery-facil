import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface EmpresaInfo {
  id?: string;
  nome: string;
  endereco: string;
  telefone: string;
  whatsapp: string;
  user_id: string;
}

const MinhaEmpresa = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [empresaInfo, setEmpresaInfo] = useState<EmpresaInfo>({
    nome: "",
    endereco: "",
    telefone: "",
    whatsapp: "",
    user_id: currentUser?.uid || "",
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    loadEmpresaInfo();
  }, [currentUser]);

  const loadEmpresaInfo = async () => {
    if (!currentUser) return;

    try {
      const empresaCollection = collection(db, "empresa_info");
      const q = query(empresaCollection, where("user_id", "==", currentUser.uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as EmpresaInfo;
        setEmpresaInfo({
          id: snapshot.docs[0].id,
          ...data,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar informações da empresa:", error);
      toast.error("Erro ao carregar informações");
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const empresaCollection = collection(db, "empresa_info");

      if (empresaInfo.id) {
        // Update existing
        const empresaDoc = doc(db, "empresa_info", empresaInfo.id);
        await updateDoc(empresaDoc, {
          nome: empresaInfo.nome,
          endereco: empresaInfo.endereco,
          telefone: empresaInfo.telefone,
          whatsapp: empresaInfo.whatsapp,
          updated_at: new Date(),
        });
        toast.success("Informações atualizadas com sucesso!");
      } else {
        // Create new
        await addDoc(empresaCollection, {
          ...empresaInfo,
          user_id: currentUser.uid,
          created_at: new Date(),
          updated_at: new Date(),
        });
        toast.success("Informações salvas com sucesso!");
        loadEmpresaInfo();
      }
    } catch (error) {
      console.error("Erro ao salvar informações:", error);
      toast.error("Erro ao salvar informações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin-dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Empresa</Label>
              <Input
                id="nome"
                value={empresaInfo.nome}
                onChange={(e) =>
                  setEmpresaInfo({ ...empresaInfo, nome: e.target.value })
                }
                placeholder="Nome da sua empresa"
              />
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={empresaInfo.endereco}
                onChange={(e) =>
                  setEmpresaInfo({ ...empresaInfo, endereco: e.target.value })
                }
                placeholder="Rua, número, bairro, cidade - estado"
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={empresaInfo.telefone}
                onChange={(e) =>
                  setEmpresaInfo({ ...empresaInfo, telefone: e.target.value })
                }
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={empresaInfo.whatsapp}
                onChange={(e) =>
                  setEmpresaInfo({ ...empresaInfo, whatsapp: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? "Salvando..." : "Salvar Informações"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MinhaEmpresa;
