
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { saveUserToSupabase, getUserById } from "@/services/supabaseService";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string, phone?: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // Atualizar o último login no Supabase quando o usuário faz login
      if (user) {
        saveUserToSupabase({
          id: user.uid,
          email: user.email || '',
          last_sign_in: new Date().toISOString()
        }).catch(error => {
          console.error("Erro ao sincronizar login com Supabase:", error);
        });
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name?: string, phone?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Após criar usuário no Firebase, salvar no Supabase
      if (result.user) {
        await saveUserToSupabase({
          id: result.user.uid,
          email: email,
          created_at: new Date().toISOString(),
          last_sign_in: new Date().toISOString(),
          name,
          phone
        });
      }
      
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo ao nosso aplicativo!",
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Atualizar o último login
      if (result.user) {
        await saveUserToSupabase({
          id: result.user.uid,
          email: email,
          last_sign_in: new Date().toISOString()
        });
      }
      
      toast({
        title: "Login realizado",
        description: "Você entrou com sucesso.",
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
