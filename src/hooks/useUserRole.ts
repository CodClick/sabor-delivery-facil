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
        // Buscar role do usuário na tabela "users"
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("firebase_id", currentUser.uid)
          .maybeSingle();
        
        console.log("Resposta Supabase users:", { data, error });

        if (error) {
          console.error("Erro ao buscar role do usuário:", error);
          setRole("user"); // Fallback para role de usuário comum
        } else {
          // Tipagem manual para contornar problema de tipos do Supabase
          const userData = data as any;
          setRole(userData?.role || "user");
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
