// authService

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveUserToSupabase, updateUserLastSignIn } from "./supabaseService";

export async function signUp(
  email: string, 
  password: string, 
  name?: string, 
  phone?: string
): Promise<UserCredential> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  if (result.user) {
    // Salva no Supabase (mantido)
    await saveUserToSupabase({
      id: result.user.uid,
      email: result.user.email || "",
      name,
      phone,
    });

    // Monta objeto para o webhook
    const userData = {
      id: result.user.uid,
      firebase_id: result.user.uid, // Firebase UID
      email: result.user.email || "",
      name: name || "",
      phone: phone || "",
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      role: "user", // default
    };

    // Envia para o webhook do n8n
    try {
      await fetch("https://n8n-n8n-start.yh11mi.easypanel.host/webhook/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
    } catch (err) {
      console.error("Erro ao enviar dados para o webhook do n8n:", err);
    }
  }
  
  return result;
}

export async function signIn(email: string, password: string): Promise<UserCredential> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  if (result.user) {
    // await updateUserLastSignIn(result.user.uid);
  }
  
  return result;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}
