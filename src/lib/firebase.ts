
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCcAoWOxsYOO2ArFpzUIeKHgM307GPnBBM",
  authDomain: "appdelivery-39c86.firebaseapp.com",
  projectId: "appdelivery-39c86",
  messagingSenderId: "910010327512",
  appId: "1:910010327512:web:1106825570fbaeda1552ad",
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Exportar o serviço de autenticação
export const auth = getAuth(app);

// Inicializar o Firestore
export const db = getFirestore(app);

// Inicializar Analytics somente no navegador para evitar erros em SSR
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
