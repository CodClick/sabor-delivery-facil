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
          .from("users")
          .select("role")
          .eq("firebase_id", currentUser.uid)
          .maybeSingle(); // 🔥 evita o 406

        if (error) {
          console.error("Erro ao buscar role do usuário:", error);
          setRole("user"); // fallback
        } else {
          setRole(data?.role || "user");
        }
      } catch (err) {
        console.error("Erro inesperado ao verificar role:", err);
        setRole("user");
      } finally {
        setLoading(false);
      }
    };

    getUserRole();
  }, [currentUser]);

  return { role, loading, isAdmin: role === "admin" };
};
