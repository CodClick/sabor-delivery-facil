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
const { data, error } = await supabase
  .from("users")
  .select("role")
  .eq("firebase_id", firebaseId);

if (error) {
  console.error("Erro Supabase:", error);
  setRole("user");
} else if (data && data.length > 0) {
  setRole(data[0].role || "user");
} else {
  setRole("user");
}
finally {
        setLoading(false);
      }
    };

    getUserRole();
  }, [currentUser]);

  return { role, loading, isAdmin: role === "admin" };
};
