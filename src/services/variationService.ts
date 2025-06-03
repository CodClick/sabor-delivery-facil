
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
import { Variation } from "@/types/menu";

export const getAllVariations = async (): Promise<Variation[]> => {
  try {
    console.log("Buscando todas as variações...");
    const variationsCollection = collection(db, "variations");
    const variationsSnapshot = await getDocs(query(variationsCollection));
    const variations = variationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Variation[];
    console.log("Variações carregadas:", variations.length);
    return variations;
  } catch (error) {
    console.error("Erro ao buscar variações:", error);
    throw error;
  }
};

export const getVariation = async (id: string): Promise<Variation | null> => {
  try {
    console.log("Buscando variação:", id);
    const variationDoc = doc(db, "variations", id);
    const variationSnapshot = await getDoc(variationDoc);

    if (variationSnapshot.exists()) {
      const variation = {
        id: variationSnapshot.id,
        ...variationSnapshot.data(),
      } as Variation;
      console.log("Variação encontrada:", variation);
      return variation;
    } else {
      console.log("Variação não encontrada");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar variação:", error);
    throw error;
  }
};

// Alias for getVariation for better API naming consistency
export const getVariationById = getVariation;

export const saveVariation = async (variation: Variation): Promise<string> => {
  try {
    console.log("Salvando variação:", variation);
    
    // Validate required fields
    if (!variation.name) {
      throw new Error("Nome da variação é obrigatório");
    }
    
    // Ensure categoryIds is an array
    if (!variation.categoryIds) {
      variation.categoryIds = [];
    }
    
    // Ensure additionalPrice is a valid number
    if (typeof variation.additionalPrice !== 'number') {
      variation.additionalPrice = 0;
    }

    if (variation.id) {
      // Update existing variation
      console.log("Atualizando variação existente:", variation.id);
      const variationDocRef = doc(db, "variations", variation.id);
      // Remove id from the object before updating
      const { id, ...variationData } = variation;
      await updateDoc(variationDocRef, variationData);
      console.log("Variação atualizada com sucesso");
      return variation.id;
    } else {
      // Create new variation
      console.log("Criando nova variação");
      const variationsCollection = collection(db, "variations");
      const docRef = await addDoc(variationsCollection, variation);
      console.log("Nova variação criada com ID:", docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.error("Erro detalhado ao salvar variação:", error);
    throw new Error(`Falha ao salvar variação: ${error.message}`);
  }
};

export const deleteVariation = async (id: string): Promise<void> => {
  try {
    console.log("Deletando variação:", id);
    const variationDocRef = doc(db, "variations", id);
    await deleteDoc(variationDocRef);
    console.log("Variação deletada com sucesso");
  } catch (error) {
    console.error("Erro ao deletar variação:", error);
    throw error;
  }
};
