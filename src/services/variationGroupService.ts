
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
import { VariationGroup } from "@/types/menu";

export const getAllVariationGroups = async (): Promise<VariationGroup[]> => {
  try {
    const variationGroupsCollection = collection(db, "variationGroups");
    const variationGroupsSnapshot = await getDocs(
      query(variationGroupsCollection)
    );
    return variationGroupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VariationGroup[];
  } catch (error) {
    console.error("Error getting variation groups:", error);
    throw error;
  }
};

export const getVariationGroup = async (
  id: string
): Promise<VariationGroup | null> => {
  try {
    const variationGroupDoc = doc(db, "variationGroups", id);
    const variationGroupSnapshot = await getDoc(variationGroupDoc);

    if (variationGroupSnapshot.exists()) {
      return {
        id: variationGroupSnapshot.id,
        ...variationGroupSnapshot.data(),
      } as VariationGroup;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting variation group:", error);
    throw error;
  }
};

// Alias for getVariationGroup for better API naming consistency
export const getVariationGroupById = getVariationGroup;

export const saveVariationGroup = async (
  variationGroup: VariationGroup
): Promise<string> => {
  try {
    if (variationGroup.id) {
      // Update existing variation group
      const variationGroupDocRef = doc(
        db,
        "variationGroups",
        variationGroup.id
      );
      // Remove id from the object before updating
      const { id, ...variationGroupData } = variationGroup;
      await updateDoc(variationGroupDocRef, variationGroupData);
      return variationGroup.id;
    } else {
      // Create new variation group
      const variationGroupsCollection = collection(db, "variationGroups");
      const docRef = await addDoc(variationGroupsCollection, variationGroup);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving variation group:", error);
    throw error;
  }
};

// Alias for saveVariationGroup for better API naming consistency
export const updateVariationGroup = saveVariationGroup;

export const deleteVariationGroup = async (id: string): Promise<void> => {
  try {
    const variationGroupDocRef = doc(db, "variationGroups", id);
    await deleteDoc(variationGroupDocRef);
  } catch (error) {
    console.error("Error deleting variation group:", error);
    throw error;
  }
};
