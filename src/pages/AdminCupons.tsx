import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface Cupom {
  id: string;
  nome: string;
  desconto: number;
  validade: string;
  ativo: boolean;
  created_at: string;
}

export default function AdminCupons() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [abrirDialog, setAbrirDialog] = useState(false);
  const [novoCupom, setNovoCupom] = useState({
    nome: "",
    desconto: "",
    validade: "",
    ativo: true,
  });

  useEffect(() => {
    buscarCupons();
  }, []);

  async function buscarCupons() {
    setLoading(true);
    const { data, error } = await supabase
      .from("cupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar cupons:", error);
    } else {
      setCupons(data || []);
    }
    setLoading(false);
  }

  async function salvarCupom() {
    if (!novoCupom.nome || !novoCupom.desconto || !novoCupom.validade) {
      alert("Preencha todos os campos!");
      return;
    }

    const { error } = await supabase.from("cupons").insert([
      {
        nome: novoCupom.nome,
        desconto: Number(novoCupom.desconto),
        validade: novoCupom.validade,
        ativo: novoCupom.ativo,
      },
    ]);

    if (error) {
      console.error("Erro ao salvar cupom:", error);
      alert("Erro ao salvar o cupom!");
    } else {
      setAbrirDialog(false);
      setNovoCupom({ nome: "", desconto: "", validade: "", ativo: true });
      buscarCupons();
    }
  }

  async function excluirCupom(id: string) {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

    const { error } = await supabase.from("cupons").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir cupom:", error);
      alert("Erro ao excluir cupom!");
    } else {
      buscarCupons();
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Cabeçalho igual ao da página Minha Empresa */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cupons de Desconto</h1>

        <Button
          onClick={() => (window.location.href = "/admin-dashboard")}
          variant="outline"
          className="border-[#fa6500] text-[#fa6500] hover:bg-[#fa6500] hover:text-white transition-colors mt-3 sm:mt-0"
        >
          Painel de Administração
        </Button>

        <Button
          onClick={() => setAbrirDialog(true)}
          className="bg-[#fa6500] hover:bg-[#e25900] text-white mt-3 sm:mt-0"
        >
          Novo Cupom
        </Button>
      </div>

      {/* Lista de cupons */}
      {loading ? (
        <p>Carregando cupons...</p>
      ) : cupons.length === 0 ? (
        <p>Nenhum cupom encontrado.</p>
      ) : (
        <div className="grid gap-4">
          {cupons.map((cupom) => (
            <Card key={cupom.id} className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{cupom.nome}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => excluirCupom(cupom.id)}
                  >
                    Excluir
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Desconto:</strong> {cupom.desconto}%</p>
                <p><strong>Validade:</strong> {new Date(cupom.validade).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {cupom.ativo ? "Ativo" : "Inativo"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para criar novo cupom */}
      <Dialog open={abrirDialog} onOpenChange={setAbrirDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Cupom</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Cupom</Label>
              <Input
                value={novoCupom.nome}
                onChange={(e) => setNovoCupom({ ...novoCupom, nome: e.target.value })}
              />
            </div>

            <div>
              <Label>Desconto (%)</Label>
              <Input
                type="number"
                value={novoCupom.desconto}
                onChange={(e) => setNovoCupom({ ...novoCupom, desconto: e.target.value })}
              />
            </div>

            <div>
              <Label>Validade</Label>
              <Input
                type="date"
                value={novoCupom.validade}
                onChange={(e) => setNovoCupom({ ...novoCupom, validade: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={salvarCupom}
                className="bg-[#fa6500] hover:bg-[#e25900] text-white"
              >
                Salvar Cupom
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
