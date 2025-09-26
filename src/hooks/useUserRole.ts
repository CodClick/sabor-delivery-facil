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
        console.log("⚠️ Nenhum usuário logado");
        setRole(null);
        setLoading(false);
        return;
      }

      console.log("🔥 currentUser.uid do Firebase:", currentUser.uid);

      try {
        const { data, error } = await supabase
          .from("users")
          .select("firebase_id, role")
          .eq("firebase_id", currentUser.uid)
          .maybeSingle(); // evita 406

        console.log("📦 Resultado da query Supabase:", data, error);

        if (error) {
          console.error("❌ Erro ao buscar role do usuário:", error);
          setRole("user");
        } else {
          setRole(data?.role || "user");
        }
      } catch (err) {
        console.error("💥 Erro inesperado ao verificar role:", err);
        setRole("user");
      } finally {
        setLoading(false);
      }
    };

    getUserRole();
  }, [currentUser]);

  return { role, loading, isAdmin: role === "admin" };
};
