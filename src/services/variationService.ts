
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
    const variationsCollection = collection(db, "variations");
    const variationsSnapshot = await getDocs(query(variationsCollection));
    return variationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Variation[];
  } catch (error) {
    console.error("Error getting variations:", error);
    throw error;
  }
};

export const getVariation = async (id: string): Promise<Variation | null> => {
  try {
    const variationDoc = doc(db, "variations", id);
    const variationSnapshot = await getDoc(variationDoc);

    if (variationSnapshot.exists()) {
      return {
        id: variationSnapshot.id,
        ...variationSnapshot.data(),
      } as Variation;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting variation:", error);
    throw error;
  }
};

// Alias for getVariation for better API naming consistency
export const getVariationById = getVariation;

export const saveVariation = async (variation: Variation): Promise<string> => {
  try {
    if (variation.id) {
      // Update existing variation
      const variationDocRef = doc(db, "variations", variation.id);
      // Remove id from the object before updating
      const { id, ...variationData } = variation;
      await updateDoc(variationDocRef, variationData);
      return variation.id;
    } else {
      // Create new variation
      const variationsCollection = collection(db, "variations");
      const docRef = await addDoc(variationsCollection, variation);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving variation:", error);
    throw error;
  }
};

export const deleteVariation = async (id: string): Promise<void> => {
  try {
    const variationDocRef = doc(db, "variations", id);
    await deleteDoc(variationDocRef);
  } catch (error) {
    console.error("Error deleting variation:", error);
    throw error;
  }
};
