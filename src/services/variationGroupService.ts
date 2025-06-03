
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
    console.log("Buscando todos os grupos de variação...");
    const variationGroupsCollection = collection(db, "variationGroups");
    const variationGroupsSnapshot = await getDocs(
      query(variationGroupsCollection)
    );
    const groups = variationGroupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VariationGroup[];
    console.log("Grupos de variação carregados:", groups.length);
    return groups;
  } catch (error) {
    console.error("Erro ao buscar grupos de variação:", error);
    throw error;
  }
};

export const getVariationGroup = async (
  id: string
): Promise<VariationGroup | null> => {
  try {
    console.log("Buscando grupo de variação:", id);
    const variationGroupDoc = doc(db, "variationGroups", id);
    const variationGroupSnapshot = await getDoc(variationGroupDoc);

    if (variationGroupSnapshot.exists()) {
      const group = {
        id: variationGroupSnapshot.id,
        ...variationGroupSnapshot.data(),
      } as VariationGroup;
      console.log("Grupo encontrado:", group);
      return group;
    } else {
      console.log("Grupo não encontrado");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar grupo de variação:", error);
    throw error;
  }
};

// Alias for getVariationGroup for better API naming consistency
export const getVariationGroupById = getVariationGroup;

export const saveVariationGroup = async (
  variationGroup: VariationGroup
): Promise<string> => {
  try {
    console.log("Salvando grupo de variação:", variationGroup);
    
    // Validate required fields
    if (!variationGroup.name) {
      throw new Error("Nome do grupo de variação é obrigatório");
    }
    
    if (!variationGroup.variations || variationGroup.variations.length === 0) {
      throw new Error("Pelo menos uma variação deve ser selecionada");
    }
    
    // Validate min/max values
    if (variationGroup.minRequired < 0) {
      variationGroup.minRequired = 0;
    }
    
    if (variationGroup.maxAllowed < 1) {
      variationGroup.maxAllowed = 1;
    }
    
    if (variationGroup.minRequired > variationGroup.maxAllowed) {
      throw new Error("O mínimo obrigatório não pode ser maior que o máximo permitido");
    }

    if (variationGroup.id) {
      // Update existing variation group
      console.log("Atualizando grupo existente:", variationGroup.id);
      const variationGroupDocRef = doc(
        db,
        "variationGroups",
        variationGroup.id
      );
      // Remove id from the object before updating
      const { id, ...variationGroupData } = variationGroup;
      await updateDoc(variationGroupDocRef, variationGroupData);
      console.log("Grupo atualizado com sucesso");
      return variationGroup.id;
    } else {
      // Create new variation group
      console.log("Criando novo grupo de variação");
      const variationGroupsCollection = collection(db, "variationGroups");
      const docRef = await addDoc(variationGroupsCollection, variationGroup);
      console.log("Novo grupo criado com ID:", docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.error("Erro detalhado ao salvar grupo de variação:", error);
    throw new Error(`Falha ao salvar grupo: ${error.message}`);
  }
};

// Alias for saveVariationGroup for better API naming consistency
export const updateVariationGroup = saveVariationGroup;

export const deleteVariationGroup = async (id: string): Promise<void> => {
  try {
    console.log("Deletando grupo de variação:", id);
    const variationGroupDocRef = doc(db, "variationGroups", id);
    await deleteDoc(variationGroupDocRef);
    console.log("Grupo deletado com sucesso");
  } catch (error) {
    console.error("Erro ao deletar grupo de variação:", error);
    throw error;
  }
};
