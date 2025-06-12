
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { MenuItem } from "@/types/menu";

export const getAllMenuItems = async (): Promise<MenuItem[]> => {
  try {
    console.log("Buscando todos os itens do menu...");
    const menuItemsCollection = collection(db, "menuItems");
    const menuItemsSnapshot = await getDocs(query(menuItemsCollection));
    const items = menuItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[];
    
    console.log("Itens carregados:", items.length);
    return items;
  } catch (error) {
    console.error("Erro ao buscar itens do menu:", error);
    throw error;
  }
};

export const getMenuItem = async (id: string): Promise<MenuItem | null> => {
  try {
    console.log("Buscando item do menu:", id);
    const menuItemDoc = doc(db, "menuItems", id);
    const menuItemSnapshot = await getDoc(menuItemDoc);

    if (menuItemSnapshot.exists()) {
      const item = {
        id: menuItemSnapshot.id,
        ...menuItemSnapshot.data(),
      } as MenuItem;
      console.log("Item encontrado:", item);
      return item;
    } else {
      console.log("Item não encontrado");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar item do menu:", error);
    throw error;
  }
};

export const saveMenuItem = async (menuItem: MenuItem): Promise<string> => {
  try {
    console.log("Salvando item do menu:", menuItem);
    
    // Validate required fields
    if (!menuItem.name || !menuItem.description || !menuItem.category) {
      throw new Error("Campos obrigatórios não preenchidos: nome, descrição e categoria são obrigatórios");
    }
    
    if (menuItem.price <= 0) {
      throw new Error("O preço deve ser maior que zero");
    }

    if (menuItem.id && menuItem.id !== "" && !menuItem.id.startsWith("temp-")) {
      // Check if the document actually exists before trying to update
      console.log("Verificando se o documento existe:", menuItem.id);
      const menuItemDocRef = doc(db, "menuItems", menuItem.id);
      const existingDoc = await getDoc(menuItemDocRef);
      
      if (existingDoc.exists()) {
        // Update existing menu item
        console.log("Atualizando item existente:", menuItem.id);
        const { id, ...menuItemData } = menuItem;
        await updateDoc(menuItemDocRef, menuItemData);
        console.log("Item atualizado com sucesso");
        return menuItem.id;
      } else {
        console.log("Documento não existe, criando novo item em vez de atualizar");
        // Document doesn't exist, create a new one instead
        const menuItemsCollection = collection(db, "menuItems");
        const { id, ...menuItemData } = menuItem;
        const docRef = await addDoc(menuItemsCollection, {
          ...menuItemData,
          image: menuItem.image || "/placeholder.svg"
        });
        console.log("Novo item criado com ID:", docRef.id);
        return docRef.id;
      }
    } else {
      // Create new menu item
      console.log("Criando novo item do menu (ID temporário ou vazio)");
      const menuItemsCollection = collection(db, "menuItems");
      const { id, ...menuItemData } = menuItem;
      const docRef = await addDoc(menuItemsCollection, {
        ...menuItemData,
        image: menuItem.image || "/placeholder.svg"
      });
      console.log("Novo item criado com ID:", docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.error("Erro detalhado ao salvar item do menu:", error);
    throw new Error(`Falha ao salvar item: ${error.message}`);
  }
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  try {
    console.log("=== INICIANDO EXCLUSÃO DE ITEM ===");
    console.log("ID recebido para exclusão:", id);
    console.log("Tipo do ID:", typeof id);
    console.log("ID limpo:", id?.trim());
    
    if (!id || typeof id !== "string" || id.trim() === "") {
      console.error("ID inválido fornecido:", id);
      throw new Error("ID do item é obrigatório e deve ser uma string válida");
    }

    const cleanId = id.trim();
    
    // Skip deletion if it's a temporary ID
    if (cleanId.startsWith("temp-")) {
      console.log("ID temporário detectado, cancelando exclusão:", cleanId);
      return;
    }
    
    console.log("Criando referência do documento...");
    const menuItemDocRef = doc(db, "menuItems", cleanId);
    console.log("Referência criada:", menuItemDocRef.path);
    
    // First verify the document exists
    console.log("Verificando se o documento existe...");
    const existingDoc = await getDoc(menuItemDocRef);
    console.log("Documento existe?", existingDoc.exists());
    
    if (!existingDoc.exists()) {
      console.log("Documento não encontrado no Firestore");
      throw new Error("Item não encontrado no banco de dados");
    }
    
    console.log("Dados do documento encontrado:", existingDoc.data());
    
    // Delete the document
    console.log("Executando exclusão...");
    await deleteDoc(menuItemDocRef);
    console.log("=== EXCLUSÃO CONCLUÍDA COM SUCESSO ===");
    
    // Verify deletion
    console.log("Verificando se a exclusão foi bem-sucedida...");
    const verificationDoc = await getDoc(menuItemDocRef);
    console.log("Documento ainda existe após exclusão?", verificationDoc.exists());
    
    if (verificationDoc.exists()) {
      throw new Error("Falha na exclusão: o documento ainda existe após a operação de exclusão");
    }
    
  } catch (error) {
    console.error("=== ERRO NA EXCLUSÃO ===");
    console.error("Erro detalhado:", error);
    console.error("Stack trace:", error.stack);
    throw error;
  }
};

// Get menu items by category
export const getMenuItemsByCategory = async (categoryId: string): Promise<MenuItem[]> => {
  try {
    console.log("Buscando itens por categoria:", categoryId);
    const menuItemsCollection = collection(db, "menuItems");
    const menuItemsSnapshot = await getDocs(
      query(menuItemsCollection, where("category", "==", categoryId))
    );
    const items = menuItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[];
    console.log("Itens encontrados para categoria:", items.length);
    return items;
  } catch (error) {
    console.error("Erro ao buscar itens por categoria:", error);
    throw error;
  }
};

export const getPopularItems = async (): Promise<MenuItem[]> => {
  try {
    console.log("Buscando itens populares...");
    const menuItemsCollection = collection(db, "menuItems");
    const menuItemsSnapshot = await getDocs(
      query(menuItemsCollection, where("popular", "==", true))
    );
    const items = menuItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[];
    console.log("Itens populares encontrados:", items.length);
    return items;
  } catch (error) {
    console.error("Erro ao buscar itens populares:", error);
    throw error;
  }
};

export const seedMenuItems = async (menuItems: MenuItem[]): Promise<void> => {
  try {
    console.log("Seedando itens do menu:", menuItems.length);
    for (const item of menuItems) {
      await saveMenuItem(item);
    }
    console.log("Seed concluído com sucesso");
  } catch (error) {
    console.error("Erro no seed de itens do menu:", error);
    throw error;
  }
};
