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
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
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
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
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

  // 🔹 Carrega dados existentes da empresa
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

  // 🔹 Busca automática de endereço pelo CEP
  const handleBuscarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setEmpresaInfo((prev) => ({
        ...prev,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || "",
      }));

      toast.success("Endereço preenchido automaticamente!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP");
    }
  };

  // 🔹 Salva ou atualiza os dados
  const handleSave = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const empresaCollection = collection(db, "empresa_info");

      if (empresaInfo.id) {
        const empresaDoc = doc(db, "empresa_info", empresaInfo.id);
        await updateDoc(empresaDoc, {
          nome: empresaInfo.nome,
          cep: empresaInfo.cep,
          rua: empresaInfo.rua,
          numero: empresaInfo.numero,
          bairro: empresaInfo.bairro,
          cidade: empresaInfo.cidade,
          uf: empresaInfo.uf,
          telefone: empresaInfo.telefone,
          whatsapp: empresaInfo.whatsapp,
          updated_at: new Date(),
        });
        toast.success("Informações atualizadas com sucesso!");
      } else {
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
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={empresaInfo.cep}
                onChange={(e) =>
                  setEmpresaInfo({ ...empresaInfo, cep: e.target.value })
                }
                onBlur={(e) => handleBuscarCEP(e.target.value)}
                placeholder="00000-000"
              />
            </div>

            <div>
              <Label htmlFor="rua">Rua</Label>
              <Input
                id="rua"
                value={empresaInfo.rua}
                onChange={(e) =>
                  setEmpresaInfo({ ...empresaInfo, rua: e.target.value })
                }
                placeholder="Nome da rua"
              />
            </div>

            <div>
              <Label htmlFor="numero">Número / Complemento</Label>
              <Input
                id="numero"
                value={empresaInfo.numero}
                onChange={(e) =>
                  setEmpresaInfo({ ...empresaInfo, numero: e.target.value })
                }
                placeholder="123 - Casa / Apto / Bloco"
              />
            </div>

            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={empresaInfo.bairro}
                onChange={(e) =>
                  setEmpresaInfo({ ...empresaInfo, bairro: e.target.value })
                }
                placeholder="Bairro"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={empresaInfo.cidade}
                  onChange={(e) =>
                    setEmpresaInfo({ ...empresaInfo, cidade: e.target.value })
                  }
                  placeholder="Cidade"
                />
              </div>

              <div>
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  value={empresaInfo.uf}
                  onChange={(e) =>
                    setEmpresaInfo({ ...empresaInfo, uf: e.target.value })
                  }
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
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
                  
