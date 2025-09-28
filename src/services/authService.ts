// authService.ts

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// ============================================
// SIGN UP (com envio direto para n8n)
// ============================================
export async function signUp(
  email: string, 
  password: string, 
  name?: string, 
  phone?: string
): Promise<UserCredential> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  if (result.user) {
    // Monta objeto para enviar para o webhook do n8n
    const userData = {
      id: result.user.uid,
      firebase_id: result.user.uid,
      email: result.user.email || "",
      name: name || "",
      phone: phone || "",
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      role: "user", // default
    };

    // DEBUG: log antes do fetch
    console.log("🔄 Enviando dados para webhook do n8n:", userData);

    try {
      const response = await fetch(
        "https://n8n-n8n-start.yh11mi.easypanel.host/webhook/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      console.log("✅ Resposta do n8n signup:", response.status, response.statusText);

      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Erro ao enviar para n8n:", text);
      }
    } catch (err) {
      console.error("⚠️ Falha no fetch para o n8n:", err);
    }
  }
  
  return result;
}

// ============================================
// SIGN IN
// ============================================
export async function signIn(email: string, password: string): Promise<UserCredential> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  if (result.user) {
    // Aqui você pode futuramente atualizar last_sign_in_at no n8n
    // await updateUserLastSignIn(result.user.uid);
  }
  
  return result;
}

// ============================================
// LOG OUT
// ============================================
export async function logOut(): Promise<void> {
  await signOut(auth);
}
