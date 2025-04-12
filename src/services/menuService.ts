
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MenuItem, Category } from "@/types/menu";

const MENU_COLLECTION = "menu";
const CATEGORIES_COLLECTION = "categories";

// Obter todos os itens do menu
export const getAllMenuItems = async (): Promise<MenuItem[]> => {
  const menuCollection = collection(db, MENU_COLLECTION);
  const menuSnapshot = await getDocs(menuCollection);
  return menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
};

// Obter itens do menu por categoria
export const getMenuItemsByCategory = async (categoryId: string): Promise<MenuItem[]> => {
  const menuCollection = collection(db, MENU_COLLECTION);
  const q = query(menuCollection, where("category", "==", categoryId));
  const menuSnapshot = await getDocs(q);
  return menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
};

// Obter itens populares
export const getPopularItems = async (): Promise<MenuItem[]> => {
  const menuCollection = collection(db, MENU_COLLECTION);
  const q = query(menuCollection, where("popular", "==", true));
  const menuSnapshot = await getDocs(q);
  return menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
};

// Adicionar ou atualizar um item do menu
export const saveMenuItem = async (item: MenuItem): Promise<void> => {
  const menuRef = doc(db, MENU_COLLECTION, item.id);
  await setDoc(menuRef, item);
};

// Excluir um item do menu
export const deleteMenuItem = async (itemId: string): Promise<void> => {
  const menuRef = doc(db, MENU_COLLECTION, itemId);
  await deleteDoc(menuRef);
};

// Obter todas as categorias
export const getAllCategories = async (): Promise<Category[]> => {
  const categoryCollection = collection(db, CATEGORIES_COLLECTION);
  const q = query(categoryCollection, orderBy("order"));
  const categorySnapshot = await getDocs(q);
  return categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

// Adicionar ou atualizar uma categoria
export const saveCategory = async (category: Category): Promise<void> => {
  const categoryRef = doc(db, CATEGORIES_COLLECTION, category.id);
  await setDoc(categoryRef, category);
};

// Excluir uma categoria
export const deleteCategory = async (categoryId: string): Promise<void> => {
  const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
  await deleteDoc(categoryRef);
};
