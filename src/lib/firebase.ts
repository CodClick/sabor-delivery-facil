
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBs1xrVnpHXrKVWmZ8x_S3JjKZGV7CvlgY",
  authDomain: "sabor-delivery-facil.firebaseapp.com",
  projectId: "sabor-delivery-facil",
  storageBucket: "sabor-delivery-facil.appspot.com",
  messagingSenderId: "234567890123",
  appId: "1:234567890123:web:abc123def456"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Exportar o serviço de autenticação
export const auth = getAuth(app);
export default app;
