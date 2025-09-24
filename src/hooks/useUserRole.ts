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
        // Buscar role do usuário na tabela "users" usando RPC para evitar problemas de tipos
        const { data, error } = await supabase.rpc('get_user_role', {
          user_uid: currentUser.uid
        });
        
        console.log("Resposta Supabase users:", { data, error });

        if (error) {
          console.error("Erro ao buscar role do usuário:", error);
          setRole("user"); // Fallback para role de usuário comum
        } else {
          setRole(typeof data === 'string' ? data : "user");
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
