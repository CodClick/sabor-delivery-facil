
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
    
    // Detectar duplicatas
    const duplicateCheck = new Map();
    const duplicates = [];
    
    groups.forEach(group => {
      if (duplicateCheck.has(group.id)) {
        duplicates.push(group.id);
        console.warn(`DUPLICATA DETECTADA: ID ${group.id} aparece múltiplas vezes`);
      } else {
        duplicateCheck.set(group.id, true);
      }
    });
    
    if (duplicates.length > 0) {
      console.warn("IDs duplicados encontrados:", duplicates);
    }
    
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
      // Check if the document actually exists before trying to update
      console.log("Verificando se o grupo de variação existe:", variationGroup.id);
      const variationGroupDocRef = doc(db, "variationGroups", variationGroup.id);
      const existingDoc = await getDoc(variationGroupDocRef);
      
      if (existingDoc.exists()) {
        // Update existing variation group
        console.log("Atualizando grupo existente:", variationGroup.id);
        const { id, ...variationGroupData } = variationGroup;
        await updateDoc(variationGroupDocRef, variationGroupData);
        console.log("Grupo atualizado com sucesso");
        return variationGroup.id;
      } else {
        // Document doesn't exist, create a new one instead
        console.log("Documento não existe, criando novo grupo em vez de atualizar");
        const variationGroupsCollection = collection(db, "variationGroups");
        const docRef = await addDoc(variationGroupsCollection, variationGroup);
        console.log("Novo grupo criado com ID:", docRef.id);
        return docRef.id;
      }
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
    console.log("=== INÍCIO PROCESSO DE EXCLUSÃO DE GRUPO DE VARIAÇÃO ===");
    console.log("deleteVariationGroup chamado com ID:", id);
    
    if (!id || id.trim() === "" || typeof id !== "string") {
      console.error("ID inválido fornecido:", { id, tipo: typeof id });
      throw new Error("ID do grupo de variação é obrigatório para exclusão e deve ser uma string válida");
    }

    const cleanId = id.trim();
    console.log("ID limpo para busca:", cleanId);
    
    // Buscar TODOS os documentos para identificar possíveis duplicatas
    console.log("=== BUSCANDO TODOS OS DOCUMENTOS PARA VERIFICAR DUPLICATAS ===");
    const variationGroupsCollection = collection(db, "variationGroups");
    const allGroupsSnapshot = await getDocs(variationGroupsCollection);
    
    // Encontrar todos os documentos que correspondem ao ID (podem haver duplicatas)
    const matchingDocs = allGroupsSnapshot.docs.filter(doc => doc.id === cleanId);
    
    console.log(`Documentos encontrados com ID ${cleanId}:`, matchingDocs.length);
    
    if (matchingDocs.length === 0) {
      console.log("=== NENHUM DOCUMENTO ENCONTRADO ===");
      console.log("Grupo não existe no Firestore - pode ser um grupo local/cache");
      console.log("Retornando sucesso para permitir remoção da interface");
      return; // Return successfully to allow UI removal
    }
    
    if (matchingDocs.length > 1) {
      console.warn(`=== DUPLICATAS DETECTADAS! ${matchingDocs.length} documentos com o mesmo ID ===`);
      matchingDocs.forEach((doc, index) => {
        console.log(`Documento ${index + 1}:`, {
          id: doc.id,
          data: doc.data()
        });
      });
    }
    
    // Excluir TODOS os documentos encontrados com o ID
    console.log(`=== EXCLUINDO ${matchingDocs.length} DOCUMENTO(S) ===`);
    
    const deletePromises = matchingDocs.map(async (docToDelete, index) => {
      console.log(`Excluindo documento ${index + 1} de ${matchingDocs.length}`);
      await deleteDoc(docToDelete.ref);
      console.log(`Documento ${index + 1} excluído com sucesso`);
    });
    
    await Promise.all(deletePromises);
    
    console.log("=== EXCLUSÃO DE GRUPO DE VARIAÇÃO CONCLUÍDA COM SUCESSO ===");
    console.log(`Total de ${matchingDocs.length} documento(s) excluído(s)`);
    
  } catch (error) {
    console.error("=== ERRO NA EXCLUSÃO DE GRUPO DE VARIAÇÃO ===");
    console.error("Mensagem do erro:", error.message);
    console.error("Erro completo:", error);
    throw new Error(`Falha ao deletar grupo de variação: ${error.message}`);
  }
};
