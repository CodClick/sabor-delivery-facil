// src/services/authService.ts
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveUserToSupabase, updateUserLastSignIn } from "./supabaseService";

export const loginWithGoogle = async (): Promise<FirebaseUser | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const firebaseUser = result.user;
    console.log("[authService] Usuário autenticado no Firebase:", firebaseUser.uid);

    // 🔥 Salvar ou atualizar no Supabase
    await saveUserToSupabase(firebaseUser);

    // 🔥 Atualizar last_sign_in
    await updateUserLastSignIn(firebaseUser);

    return firebaseUser;
  } catch (error) {
    console.error("[authService] Erro no login com Google:", error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("[authService] Usuário desconectado do Firebase.");
  } catch (error) {
    console.error("[authService] Erro ao deslogar:", error);
  }
};

/**
 * Listener para mudanças de autenticação no Firebase
 * Callback será chamado com `FirebaseUser | null`
 */
export const listenToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      console.log("[authService] Usuário logado detectado:", firebaseUser.uid);

      // 🔥 Garantir que o usuário esteja salvo no Supabase
      await saveUserToSupabase(firebaseUser);

      // 🔥 Atualizar last_sign_in
      await updateUserLastSignIn(firebaseUser);

      callback(firebaseUser);
    } else {
      console.log("[authService] Nenhum usuário logado.");
      callback(null);
    }
  });
};
