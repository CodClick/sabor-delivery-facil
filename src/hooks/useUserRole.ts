import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

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
        const response = await fetch(
          "https://n8n-n8n-start.yh11mi.easypanel.host/webhook/user_role",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ firebase_id: currentUser.uid }),
          }
        );

        if (!response.ok) {
          throw new Error(`Erro na chamada do webhook: ${response.status}`);
        }

        const data = await response.json();
        console.log("Resposta do n8n:", data);

        // Extrai role do primeiro item do array retornado
// novo - aceita objeto ou array
let userData: any = null;

if (Array.isArray(data) && data.length > 0) {
  userData = data[0];
} else if (data && typeof data === "object") {
  userData = data;
}

setRole(userData?.role || "user");

      } catch (error) {
        console.error("Erro ao buscar role via webhook:", error);
        setRole("user"); // fallback
      } finally {
        setLoading(false);
      }
    };

    getUserRole();
  }, [currentUser]);

  return { role, loading, isAdmin: role === "admin" };
};
