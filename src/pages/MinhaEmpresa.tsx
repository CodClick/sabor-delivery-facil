import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/cliente"; // ✅ import do Supabase
import { db } from "@/firebase"; // assumindo que o Firestore é importado daqui
import { collection, addDoc } from "firebase/firestore";

export default function MinhaEmpresa() {
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [complemento, setComplemento] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const endereco = {
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
      // 🔥 Salvamento no Firestore (mantido igual)
      const docRef = await addDoc(collection(db, "empresa_info"), endereco);
      console.log("Endereço salvo no Firestore, ID:", docRef.id);

      // 🧩 Duplicação no Supabase
      const { data, error } = await supabase.from("empresa_info").insert([
        {
          user_id: docRef.id, // 🔗 referenciando o ID do Firestore
          cep: endereco.cep,
          rua: endereco.rua,
          numero: endereco.numero,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado,
          complemento: endereco.complemento,
          pais: endereco.pais,
          created_at: endereco.created_at,
        },
      ]);

      if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        setMessage("Endereço salvo no Firestore, mas houve erro ao enviar para o Supabase.");
      } else {
        console.log("Endereço duplicado no Supabase:", data);
        setMessage("Endereço salvo com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      setMessage("Erro ao salvar o endereço.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Minha Empresa</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label>CEP</label>
          <input
            type="text"
            value={cep}
            onChange={(e) => {
              setCep(e.target.value);
              buscarEndereco(e.target.value);
            }}
            className="w-full border rounded p-2"
            placeholder="Digite o CEP"
          />
        </div>
        <div>
          <label>Rua</label>
          <input
            type="text"
            value={rua}
            onChange={(e) => setRua(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label>Número / Complemento</label>
          <input
            type="text"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Ex: 123 ou 123A, apto 4"
          />
        </div>
        <div>
          <label>Bairro</label>
          <input
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label>Cidade</label>
          <input
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label>Estado</label>
          <input
            type="text"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label>Complemento</label>
          <input
            type="text"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded p-2"
        >
          {loading ? "Salvando..." : "Salvar Endereço"}
        </button>
      </form>
      {message && <p className="mt-3 text-center text-gray-700">{message}</p>}
    </div>
  );
}
