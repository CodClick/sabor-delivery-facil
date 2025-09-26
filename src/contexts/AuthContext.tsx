// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  saveUserToSupabase, 
  updateUserLastSignIn, 
  getUserById, 
  getUserRole 
} from "@/services/supabaseService";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  role: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  role: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (user) {
        console.log("[AuthContext] Usuário autenticado no Firebase:", user.uid);

        try {
          // 🔹 Salvar ou atualizar usuário no Supabase
          await saveUserToSupabase(user);
          await updateUserLastSignIn(user);

          // 🔹 Buscar dados do usuário
          const supabaseUser = await getUserById(user.uid);
          console.log("[AuthContext] Dados do usuário no Supabase:", supabaseUser);

          // 🔹 Buscar role
          const userRole = await getUserRole(user.uid);
          console.log("[AuthContext] Role encontrada:", userRole);

          setRole(userRole);
        } catch (error) {
          console.error("[AuthContext] Erro ao sincronizar usuário com Supabase:", error);
        }

        setCurrentUser(user);
      } else {
        console.log("[AuthContext] Nenhum usuário autenticado");
        setCurrentUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, role }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
