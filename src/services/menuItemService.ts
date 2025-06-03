
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

    if (menuItem.id) {
      // Update existing menu item
      console.log("Atualizando item existente:", menuItem.id);
      const menuItemDocRef = doc(db, "menuItems", menuItem.id);
      // Remove id from the object before updating (to prevent Firebase errors)
      const { id, ...menuItemData } = menuItem;
      await updateDoc(menuItemDocRef, menuItemData);
      console.log("Item atualizado com sucesso");
      return menuItem.id;
    } else {
      // Create new menu item
      console.log("Criando novo item do menu");
      const menuItemsCollection = collection(db, "menuItems");
      const docRef = await addDoc(menuItemsCollection, {
        ...menuItem,
        image: menuItem.image || "/placeholder.svg" // Default image if not provided
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
    console.log("Deletando item do menu:", id);
    const menuItemDocRef = doc(db, "menuItems", id);
    await deleteDoc(menuItemDocRef);
    console.log("Item deletado com sucesso");
  } catch (error) {
    console.error("Erro ao deletar item do menu:", error);
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

// Get popular items
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
