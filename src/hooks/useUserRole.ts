import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const { currentUser } = useAuth(); // Firebase currentUser
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
        // Obter o usuário do Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData?.user) {
          console.error("Erro ao obter usuário autenticado do Supabase:", authError);
          setRole("user");
          setLoading(false);
          return;
        }

        const userId = authData.user.id; // este é o user_id na tabela users
        console.log("🔑 user_id do Supabase:", userId);

        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar role do usuário:", error);
          setRole("user");
        } else if (!data) {
          console.warn("⚠️ Nenhuma role encontrada para o usuário:", userId);
          setRole("user");
        } else {
          console.log("📦 Role encontrada:", data.role);
          setRole(data.role);
        }
      } catch (error) {
        console.error("Erro inesperado ao verificar role:", error);
        setRole("user");
      } finally {
        setLoading(false);
      }
    };

    getUserRole();
  }, [currentUser]);

  return { role, loading, isAdmin: role === "admin" };
};
