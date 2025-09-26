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
        const firebaseId = currentUser.uid;
        console.log("🔥 currentUser.uid do Firebase:", firebaseId);

const { data, error } = await supabase
  .from("users")
  .select("id, firebase_id, role")
  .eq("firebase_id", firebaseId);

console.log("📦 Resultado Supabase:", data, error);


        if (error) {
          console.error("💥 Erro ao buscar role do usuário:", error);
          setRole("user");
        } else if (data && data.length > 0) {
          setRole(data[0].role || "user");
        } else {
          console.warn("⚠️ Nenhuma role encontrada para o usuário:", firebaseId);
          setRole("user");
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
