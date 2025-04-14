
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MenuItem, Category } from "@/types/menu";

const MENU_COLLECTION = "menu";
const CATEGORIES_COLLECTION = "categories";

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
