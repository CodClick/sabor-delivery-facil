import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";

const Admin = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [variationGroups, setVariationGroups] = useState<VariationGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("menu");

export default function MinhaEmpresa() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [complemento, setComplemento] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔍 Busca automática no ViaCEP
  const buscarEndereco = async (cepDigitado: string) => {
    const cepLimpo = cepDigitado.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await resposta.json();

        if (!data.erro) {
          setRua(data.logradouro || "");
          setBairro(data.bairro || "");
          setCidade(data.localidade || "");
          setEstado(data.uf || "");
        } else {
          toast.error("CEP não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toast.error("Erro ao buscar o CEP.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const empresa = {
      nome,
      telefone,
      whatsapp,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      complemento,
      pais: "Brasil",
      created_at: new Date().toISOString(),
    };

    try {
      // 🔥 Salvamento no Firestore
      const docRef = await addDoc(collection(db, "empresa_info"), empresa);
      console.log("Empresa salva no Firestore, ID:", docRef.id);

      // 🧩 Duplicação no Supabase
      const { error } = await supabase.from("empresa_info").insert([
        {
          user_id: docRef.id,
          nome: empresa.nome,
          telefone: empresa.telefone,
          whatsapp: empresa.whatsapp,
          cep: empresa.cep,
          rua: empresa.rua,
          numero: empresa.numero,
          bairro: empresa.bairro,
          cidade: empresa.cidade,
          estado: empresa.estado,
          complemento: empresa.complemento,
          pais: empresa.pais,
          created_at: empresa.created_at,
        },
      ]);

      if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        toast.warning("Salvo no Firebase, mas houve erro ao enviar ao Supabase.");
      } else {
        toast.success("Informações salvas com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
      toast.error("Erro ao salvar as informações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#fa6500]">
          Informações da Empresa
        </h1>

            <Button 
              onClick={() => navigate("/admin-dashboard")} 
              variant="outline"
              className="w-full sm:w-auto text-sm"
            >
              Painel de Administração 
            </Button>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Pizzaria Primo's"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#fa6500]"
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">Telefone</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 0000-0000"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#fa6500]"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">WhatsApp</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#fa6500]"
            />
          </div>

          <hr className="my-4" />

          {/* Endereço */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">CEP</label>
            <input
              type="text"
              value={cep}
              onChange={(e) => {
                setCep(e.target.value);
                buscarEndereco(e.target.value);
              }}
              placeholder="Digite o CEP"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#fa6500]"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Rua</label>
            <input
              type="text"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              placeholder="Rua Exemplo"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#fa6500]"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Número / Complemento
            </label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="123, apto 4"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#fa6500]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Bairro</label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#fa6500]"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Cidade</label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#fa6500]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Estado (UF)</label>
            <input
              type="text"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              placeholder="SP"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#fa6500]"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Complemento</label>
            <input
              type="text"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
              placeholder="Ponto de referência, bloco, etc."
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#fa6500]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-white font-semibold shadow-md transition-all duration-200 bg-[#fa6500] hover:bg-[#e75a00]"
          >
            {loading ? "Salvando..." : "Salvar Informações"}
          </button>
        </form>
      </div>
    </div>
  );
}
