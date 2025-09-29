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
    
    // Map documents and immediately filter out invalid ones
    const rawGroups = variationGroupsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as VariationGroup)
      .filter(group => {
        // Filter out groups with empty or invalid IDs
        const isValid = group.id && typeof group.id === 'string' && group.id.trim() !== '';
        if (!isValid) {
          console.warn("Filtering out invalid variation group during load:", group);
        }
        return isValid;
      });
    
    console.log("Raw groups after initial filtering:", rawGroups.length);
    
    // Remove duplicates based on ID
    const uniqueGroups = new Map<string, VariationGroup>();
    const duplicateIds = new Set<string>();
    
    rawGroups.forEach(group => {
      if (uniqueGroups.has(group.id)) {
        duplicateIds.add(group.id);
        console.warn(`DUPLICATA DETECTADA NO FIRESTORE: ID ${group.id}`);
      } else {
        uniqueGroups.set(group.id, group);
      }
    });
    
    const cleanGroups = Array.from(uniqueGroups.values());
    
    if (duplicateIds.size > 0) {
      console.warn("Total de IDs duplicados encontrados:", Array.from(duplicateIds));
      console.log("Grupos únicos após limpeza:", cleanGroups.length);
    }
    
    console.log("Grupos de variação carregados (finais):", cleanGroups.length);
    return cleanGroups;
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
    if (!variationGroup.name || variationGroup.name.trim() === '') {
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

    // Clean the data before saving - remove any empty/invalid properties
    const cleanVariationGroup = {
      name: variationGroup.name.trim(),
      internalName: variationGroup.internalName?.trim() || "", // 🔥 ADICIONADO
      minRequired: variationGroup.minRequired,
      maxAllowed: variationGroup.maxAllowed,
      variations: variationGroup.variations.filter(id => id && id.trim() !== ''),
      customMessage: variationGroup.customMessage?.trim() || ""
    };

    if (variationGroup.id && variationGroup.id.trim() !== '') {
      // Check if the document actually exists before trying to update
      console.log("Verificando se o grupo de variação existe:", variationGroup.id);
      const variationGroupDocRef = doc(db, "variationGroups", variationGroup.id);
      const existingDoc = await getDoc(variationGroupDocRef);
      
      if (existingDoc.exists()) {
        // Update existing variation group
        console.log("Atualizando grupo existente:", variationGroup.id);
        await updateDoc(variationGroupDocRef, cleanVariationGroup);
        console.log("Grupo atualizado com sucesso");
        return variationGroup.id;
      } else {
        // Document doesn't exist, create a new one instead
        console.log("Documento não existe, criando novo grupo em vez de atualizar");
        const variationGroupsCollection = collection(db, "variationGroups");
        const docRef = await addDoc(variationGroupsCollection, cleanVariationGroup);
        console.log("Novo grupo criado com ID:", docRef.id);
        return docRef.id;
      }
    } else {
      // Create new variation group
      console.log("Criando novo grupo de variação");
      const variationGroupsCollection = collection(db, "variationGroups");
      const docRef = await addDoc(variationGroupsCollection, cleanVariationGroup);
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
    
    if (!id || id.trim() === "") {
      throw new Error("ID do grupo de variação é obrigatório para exclusão");
    }

    const variationGroupDocRef = doc(db, "variationGroups", id);
    
    // Verificar se o documento existe antes de tentar deletar
    const docSnapshot = await getDoc(variationGroupDocRef);
    
    if (!docSnapshot.exists()) {
      console.log("Documento não encontrado para exclusão:", id);
      // Retorna sucesso para permitir limpeza da interface
      return;
    }
    
    console.log("Documento encontrado, deletando...");
    await deleteDoc(variationGroupDocRef);
    console.log("Grupo deletado com sucesso:", id);
  } catch (error) {
    console.error("Erro ao deletar grupo de variação:", error);
    throw new Error(`Falha ao deletar grupo de variação: ${error.message}`);
  }
};
