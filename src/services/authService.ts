// src/services/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveUserToSupabase, updateUserLastSignIn } from "./supabaseService";

// 🔹 Cadastro com email/senha
export async function signUp(
  email: string,
  password: string,
  name?: string,
  phone?: string
): Promise<UserCredential> {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  if (result.user) {
    await saveUserToSupabase({
      id: result.user.uid,
      email: result.user.email || "",
      name,
      phone,
    });
  }

  return result;
}

// 🔹 Login com email/senha
export async function signIn(
  email: string,
  password: string
): Promise<UserCredential> {
  const result = await signInWithEmailAndPassword(auth, email, password);

  if (result.user) {
    await updateUserLastSignIn(result.user.uid);
  }

  return result;
}

// 🔹 Login com Google
export const loginWithGoogle = async (): Promise<FirebaseUser | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const firebaseUser = result.user;
    console.log("[authService] Usuário autenticado no Firebase:", firebaseUser.uid);

    await saveUserToSupabase(firebaseUser);
    await updateUserLastSignIn(firebaseUser);

    return firebaseUser;
  } catch (error) {
    console.error("[authService] Erro no login com Google:", error);
    return null;
  }
};

// 🔹 Logout
export async function logOut(): Promise<void> {
  await signOut(auth);
  console.log("[authService] Usuário desconectado do Firebase.");
}

// 🔹 Listener de mudanças de autenticação
export const listenToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      console.log("[authService] Usuário logado detectado:", firebaseUser.uid);

      await saveUserToSupabase(firebaseUser);
      await updateUserLastSignIn(firebaseUser);

      callback(firebaseUser);
    } else {
      console.log("[authService] Nenhum usuário logado.");
      callback(null);
    }
  });
};
