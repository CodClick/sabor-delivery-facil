import { collection, getDocs, doc, setDoc, deleteDoc, query, where, orderBy, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MenuItem, Category, Variation, VariationGroup } from "@/types/menu";

const MENU_COLLECTION = "menu";
const CATEGORIES_COLLECTION = "categories";
const VARIATIONS_COLLECTION = "variations";
const VARIATION_GROUPS_COLLECTION = "variation_groups";

// Obter todos os itens do menu
export const getAllMenuItems = async (): Promise<MenuItem[]> => {
  try {
    const menuCollection = collection(db, MENU_COLLECTION);
    const menuSnapshot = await getDocs(menuCollection);
    return menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
  } catch (error) {
    console.error("Erro ao obter itens do menu:", error);
    // Retornar dados locais como fallback
    const { menuItems } = await import("@/data/menuData");
    return menuItems;
  }
};

// Obter itens do menu por categoria
export const getMenuItemsByCategory = async (categoryId: string): Promise<MenuItem[]> => {
  try {
    const menuCollection = collection(db, MENU_COLLECTION);
    const q = query(menuCollection, where("category", "==", categoryId));
    const menuSnapshot = await getDocs(q);
    return menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
  } catch (error) {
    console.error("Erro ao obter itens por categoria:", error);
    // Retornar dados locais como fallback
    const { getMenuItemsByCategory } = await import("@/data/menuData");
    return getMenuItemsByCategory(categoryId);
  }
};

// Obter itens populares
export const getPopularItems = async (): Promise<MenuItem[]> => {
  try {
    const menuCollection = collection(db, MENU_COLLECTION);
    const q = query(menuCollection, where("popular", "==", true));
    const menuSnapshot = await getDocs(q);
    return menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
  } catch (error) {
    console.error("Erro ao obter itens populares:", error);
    // Retornar dados locais como fallback
    const { getPopularItems } = await import("@/data/menuData");
    return getPopularItems();
  }
};

// Adicionar ou atualizar um item do menu
export const saveMenuItem = async (item: MenuItem): Promise<void> => {
  try {
    const menuRef = doc(db, MENU_COLLECTION, item.id);
    await setDoc(menuRef, item);
  } catch (error) {
    console.error("Erro ao salvar item do menu:", error);
    throw error;
  }
};

// Excluir um item do menu
export const deleteMenuItem = async (itemId: string): Promise<void> => {
  try {
    const menuRef = doc(db, MENU_COLLECTION, itemId);
    await deleteDoc(menuRef);
  } catch (error) {
    console.error("Erro ao excluir item do menu:", error);
    throw error;
  }
};

// Obter todas as categorias
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const categoryCollection = collection(db, CATEGORIES_COLLECTION);
    const q = query(categoryCollection, orderBy("order"));
    const categorySnapshot = await getDocs(q);
    return categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  } catch (error) {
    console.error("Erro ao obter categorias:", error);
    // Retornar dados locais como fallback
    const { categories } = await import("@/data/menuData");
    return categories;
  }
};

// Adicionar ou atualizar uma categoria
export const saveCategory = async (category: Category): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, category.id);
    await setDoc(categoryRef, category);
  } catch (error) {
    console.error("Erro ao salvar categoria:", error);
    throw error;
  }
};

// Excluir uma categoria
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    throw error;
  }
};

// Update a category
export const updateCategory = async (category: Category): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, category.id);
    await setDoc(categoryRef, category);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    throw error;
  }
};

// Obter todas as variações
export const getAllVariations = async (): Promise<Variation[]> => {
  try {
    const variationCollection = collection(db, VARIATIONS_COLLECTION);
    const variationSnapshot = await getDocs(variationCollection);
    return variationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Variation));
  } catch (error) {
    console.error("Erro ao obter variações:", error);
    // Retornar dados locais como fallback
    const { variations } = await import("@/data/menuData");
    return variations;
  }
};

// Obter uma variação específica pelo ID
export const getVariationById = async (variationId: string): Promise<Variation | null> => {
  try {
    const variationRef = doc(db, VARIATIONS_COLLECTION, variationId);
    const variationSnapshot = await getDoc(variationRef);
    
    if (variationSnapshot.exists()) {
      return { id: variationSnapshot.id, ...variationSnapshot.data() } as Variation;
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter variação:", error);
    return null;
  }
};

// Adicionar ou atualizar uma variação
export const saveVariation = async (variation: Variation): Promise<void> => {
  try {
    const variationRef = doc(db, VARIATIONS_COLLECTION, variation.id);
    await setDoc(variationRef, variation);
  } catch (error) {
    console.error("Erro ao salvar variação:", error);
    throw error;
  }
};

// Excluir uma variação
export const deleteVariation = async (variationId: string): Promise<void> => {
  try {
    const variationRef = doc(db, VARIATIONS_COLLECTION, variationId);
    await deleteDoc(variationRef);
  } catch (error) {
    console.error("Erro ao excluir variação:", error);
    throw error;
  }
};

// NOVO - Métodos para gerenciar grupos de variações
// Obter todos os grupos de variações
export const getAllVariationGroups = async (): Promise<VariationGroup[]> => {
  try {
    const groupsCollection = collection(db, VARIATION_GROUPS_COLLECTION);
    const groupsSnapshot = await getDocs(groupsCollection);
    return groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VariationGroup));
  } catch (error) {
    console.error("Erro ao obter grupos de variações:", error);
    // Return empty array as fallback for now
    return [];
  }
};

// Obter um grupo de variação específico pelo ID
export const getVariationGroupById = async (groupId: string): Promise<VariationGroup | null> => {
  try {
    const groupRef = doc(db, VARIATION_GROUPS_COLLECTION, groupId);
    const groupSnapshot = await getDoc(groupRef);
    
    if (groupSnapshot.exists()) {
      return { id: groupSnapshot.id, ...groupSnapshot.data() } as VariationGroup;
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter grupo de variação:", error);
    return null;
  }
};

// Adicionar um novo grupo de variação
export const saveVariationGroup = async (group: VariationGroup): Promise<void> => {
  try {
    const groupRef = doc(db, VARIATION_GROUPS_COLLECTION, group.id);
    await setDoc(groupRef, group);
  } catch (error) {
    console.error("Erro ao salvar grupo de variação:", error);
    throw error;
  }
};

// Atualizar um grupo de variação existente
export const updateVariationGroup = async (group: VariationGroup): Promise<void> => {
  try {
    const groupRef = doc(db, VARIATION_GROUPS_COLLECTION, group.id);
    await setDoc(groupRef, group);
  } catch (error) {
    console.error("Erro ao atualizar grupo de variação:", error);
    throw error;
  }
};

// Excluir um grupo de variação
export const deleteVariationGroup = async (groupId: string): Promise<void> => {
  try {
    // TODO: Consider checking if this group is used by any menu items before deleting
    const groupRef = doc(db, VARIATION_GROUPS_COLLECTION, groupId);
    await deleteDoc(groupRef);
  } catch (error) {
    console.error("Erro ao excluir grupo de variação:", error);
    throw error;
  }
};

// Modificar o item selection dialog para associar grupos de variações nos itens do menu
export const getVariationsForGroup = async (groupId: string): Promise<Variation[]> => {
  try {
    const group = await getVariationGroupById(groupId);
    if (!group) return [];
    
    const allVariations = await getAllVariations();
    return allVariations.filter(variation => 
      variation.available && group.variations.includes(variation.id)
    );
  } catch (error) {
    console.error("Erro ao obter variações para grupo:", error);
    return [];
  }
};

// Utility function to get all variations that can be used in a menu item based on its assigned variation groups
export const getAvailableVariationsForMenuItem = async (menuItem: MenuItem): Promise<{[groupId: string]: Variation[]}> => {
  if (!menuItem.variationGroups || menuItem.variationGroups.length === 0) {
    return {};
  }

  try {
    const result: {[groupId: string]: Variation[]} = {};
    const allVariations = await getAllVariations();
    
    for (const groupId of menuItem.variationGroups.map(g => g.id)) {
      const group = await getVariationGroupById(groupId);
      if (group) {
        result[groupId] = allVariations.filter(
          v => v.available && group.variations.includes(v.id)
        );
      }
    }
    
    return result;
  } catch (error) {
    console.error("Erro ao obter variações para item do menu:", error);
    return {};
  }
};
