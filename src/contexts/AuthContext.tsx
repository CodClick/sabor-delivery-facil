
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
import { 
  saveUserToSupabase, 
  getUserById, 
  updateUserLastSignIn 
} from "@/services/supabaseService";

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

  // Função para sincronizar usuário com o Supabase
  const syncUserWithSupabase = async (user: User, name?: string, phone?: string) => {
    if (!user || !user.uid || !user.email) {
      console.error("Dados de usuário incompletos para sincronização com Supabase", user);
      return;
    }
    
    try {
      console.log("Iniciando sincronização com Supabase para usuário:", user.uid);
      
      // Buscar usuário existente do Supabase para preservar dados
      const existingUser = await getUserById(user.uid);
      
      // Preparar dados do usuário para sincronização
      const userData = {
        id: user.uid,
        email: user.email || '',
        last_sign_in: new Date().toISOString(),
        // Preservar nome e telefone existentes se não foram fornecidos novos
        name: name || (existingUser?.name || null),
        phone: phone || (existingUser?.phone || null),
        // Preservar data de criação se existir
        created_at: existingUser?.created_at || new Date().toISOString()
      };
      
      console.log("Dados preparados para sincronização:", userData);
      
      const result = await saveUserToSupabase(userData);

      if (result === null) {
        console.warn("Sincronização com Supabase falhou, mas o fluxo do usuário não será interrompido");
        
        // Notificar o usuário sobre o problema de sincronização
        toast({
          title: "Aviso",
          description: "Seus dados foram salvos localmente, mas houve um problema com a sincronização com o banco de dados.",
          variant: "destructive",
        });
      } else {
        console.log("Sincronização com Supabase concluída com sucesso:", result);
      }
    } catch (error) {
      console.error("Erro ao sincronizar usuário com Supabase:", error);
      
      // Não lançamos o erro para evitar interromper o fluxo do usuário
      toast({
        title: "Aviso",
        description: "Seus dados foram salvos localmente, mas houve um problema com a sincronização.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Atualizar o último login no Supabase quando o usuário faz login
      if (user) {
        try {
          console.log("Tentando atualizar último login para usuário:", user.uid);
          const result = await updateUserLastSignIn(user.uid);
          
          if (!result) {
            console.warn("Falha ao atualizar último login no Supabase, mas o fluxo do usuário não será interrompido");
          } else {
            console.log("Último login atualizado com sucesso no Supabase");
          }
        } catch (error) {
          console.error("Erro ao atualizar último login:", error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name?: string, phone?: string) => {
    try {
      console.log("Iniciando cadastro para email:", email);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Após criar usuário no Firebase, sincronizar com Supabase
      if (result.user) {
        console.log("Usuário criado no Firebase, sincronizando com Supabase");
        await syncUserWithSupabase(result.user, name, phone);
      }
      
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo ao nosso aplicativo!",
      });
      
      return result;
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      
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
      console.log("Iniciando login para email:", email);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Sincronizar com Supabase após login
      if (result.user) {
        console.log("Login realizado no Firebase, sincronizando com Supabase");
        await syncUserWithSupabase(result.user);
      }
      
      toast({
        title: "Login realizado",
        description: "Você entrou com sucesso.",
      });
      
      return result;
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      
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
      console.error("Erro ao fazer logout:", error);
      
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
