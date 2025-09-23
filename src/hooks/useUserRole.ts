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
const { data, error } = await supabase
  .from("usuarios")
  .select("*")
  .eq("firebase_id", "ZXmSQVdFKVc0Ie3q1QIQExV3qgz2")
  .single();

console.log("Teste query específica:", { data, error });


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
