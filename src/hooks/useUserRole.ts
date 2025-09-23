import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const { currentUser } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async () => {
      if (!currentUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // 🔎 teste simples para confirmar se a tabela 'usuarios' está acessível
        const { data: testData, error: testError } = await supabase
          .from("usuarios")
          .select("*")
          .limit(1);
        console.log("Teste tabela 'usuarios':", { testData, testError });

        // 🔎 query real para buscar o role do usuário
        const { data, error } = await supabase
          .from("usuarios")
          .select("role")
          .eq("firebase_id", currentUser.uid)
          .single();
        console.log("Resposta Supabase:", { data, error });

        if (error) {
          console.error("Erro ao buscar role do usuário:", error);
          setRole("user"); // Fallback para role de usuário comum
        } else {
          setRole(data?.role || "user");
        }
      } catch (error) {
        console.error("Erro ao verificar role:", error);
        setRole("user");
      } finally {
        setLoading(false);
      }
    };

    getUserRole();
  }, [currentUser]);

  return { role, loading, isAdmin: role === "admin" };
};
