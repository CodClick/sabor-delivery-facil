import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export interface PizzaBorder {
  id: string;
  name: string;
  description?: string;
  additionalPrice: number;
  available: boolean;
}

export const getAllPizzaBorders = async (): Promise<PizzaBorder[]> => {
  try {
    console.log("Buscando todas as bordas de pizza...");
    const bordersCollection = collection(db, "pizzaBorders");
    const bordersSnapshot = await getDocs(query(bordersCollection));
    
    const borders = bordersSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as PizzaBorder)
      .filter(border => {
        const isValid = border.id && typeof border.id === 'string' && border.id.trim() !== '';
        if (!isValid) {
          console.warn("Filtering out invalid pizza border:", border);
        }
        return isValid;
      });
    
    console.log("Bordas de pizza carregadas:", borders.length);
    return borders;
  } catch (error) {
    console.error("Erro ao buscar bordas de pizza:", error);
    throw error;
  }
};

export const getPizzaBorder = async (id: string): Promise<PizzaBorder | null> => {
  try {
    console.log("Buscando borda de pizza:", id);
    const borderDoc = doc(db, "pizzaBorders", id);
    const borderSnapshot = await getDoc(borderDoc);

    if (borderSnapshot.exists()) {
      const border = {
        id: borderSnapshot.id,
        ...borderSnapshot.data(),
      } as PizzaBorder;
      console.log("Borda encontrada:", border);
      return border;
    } else {
      console.log("Borda não encontrada");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar borda de pizza:", error);
    throw error;
  }
};

export const savePizzaBorder = async (border: PizzaBorder): Promise<string> => {
  try {
    console.log("Salvando borda de pizza:", border);
    
    if (!border.name || border.name.trim() === '') {
      throw new Error("Nome da borda é obrigatório");
    }
    
    const cleanBorder = {
      name: border.name.trim(),
      description: border.description?.trim() || "",
      additionalPrice: border.additionalPrice || 0,
      available: border.available ?? true,
    };

    if (border.id && border.id.trim() !== '' && !border.id.startsWith('temp-')) {
      const borderDocRef = doc(db, "pizzaBorders", border.id);
      const existingDoc = await getDoc(borderDocRef);
      
      if (existingDoc.exists()) {
        console.log("Atualizando borda existente:", border.id);
        await updateDoc(borderDocRef, cleanBorder);
        console.log("Borda atualizada com sucesso");
        return border.id;
      } else {
        console.log("Documento não existe, criando nova borda");
        const bordersCollection = collection(db, "pizzaBorders");
        const docRef = await addDoc(bordersCollection, cleanBorder);
        console.log("Nova borda criada com ID:", docRef.id);
        return docRef.id;
      }
    } else {
      console.log("Criando nova borda de pizza");
      const bordersCollection = collection(db, "pizzaBorders");
      const docRef = await addDoc(bordersCollection, cleanBorder);
      console.log("Nova borda criada com ID:", docRef.id);
      return docRef.id;
    }
  } catch (error: any) {
    console.error("Erro ao salvar borda de pizza:", error);
    throw new Error(`Falha ao salvar borda: ${error.message}`);
  }
};

export const deletePizzaBorder = async (id: string): Promise<void> => {
  try {
    console.log("Deletando borda de pizza:", id);
    
    if (!id || id.trim() === "") {
      throw new Error("ID da borda é obrigatório para exclusão");
    }

    const borderDocRef = doc(db, "pizzaBorders", id);
    const docSnapshot = await getDoc(borderDocRef);
    
    if (!docSnapshot.exists()) {
      console.log("Documento não encontrado para exclusão:", id);
      return;
    }
    
    console.log("Documento encontrado, deletando...");
    await deleteDoc(borderDocRef);
    console.log("Borda deletada com sucesso:", id);
  } catch (error: any) {
    console.error("Erro ao deletar borda de pizza:", error);
    throw new Error(`Falha ao deletar borda: ${error.message}`);
  }
};
