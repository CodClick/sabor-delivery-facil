
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
    const menuItemsCollection = collection(db, "menuItems");
    const menuItemsSnapshot = await getDocs(query(menuItemsCollection));
    return menuItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[];
  } catch (error) {
    console.error("Error getting menu items:", error);
    throw error;
  }
};

export const getMenuItem = async (id: string): Promise<MenuItem | null> => {
  try {
    const menuItemDoc = doc(db, "menuItems", id);
    const menuItemSnapshot = await getDoc(menuItemDoc);

    if (menuItemSnapshot.exists()) {
      return {
        id: menuItemSnapshot.id,
        ...menuItemSnapshot.data(),
      } as MenuItem;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting menu item:", error);
    throw error;
  }
};

export const saveMenuItem = async (menuItem: MenuItem): Promise<string> => {
  try {
    if (menuItem.id) {
      // Update existing menu item
      const menuItemDocRef = doc(db, "menuItems", menuItem.id);
      // Remove id from the object before updating (to prevent Firebase errors)
      const { id, ...menuItemData } = menuItem;
      await updateDoc(menuItemDocRef, menuItemData);
      return menuItem.id;
    } else {
      // Create new menu item
      const menuItemsCollection = collection(db, "menuItems");
      const docRef = await addDoc(menuItemsCollection, menuItem);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving menu item:", error);
    throw error;
  }
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  try {
    const menuItemDocRef = doc(db, "menuItems", id);
    await deleteDoc(menuItemDocRef);
  } catch (error) {
    console.error("Error deleting menu item:", error);
    throw error;
  }
};

// Get menu items by category
export const getMenuItemsByCategory = async (categoryId: string): Promise<MenuItem[]> => {
  try {
    const menuItemsCollection = collection(db, "menuItems");
    const menuItemsSnapshot = await getDocs(
      query(menuItemsCollection, where("category", "==", categoryId))
    );
    return menuItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[];
  } catch (error) {
    console.error("Error getting menu items by category:", error);
    throw error;
  }
};

// Get popular items
export const getPopularItems = async (): Promise<MenuItem[]> => {
  try {
    const menuItemsCollection = collection(db, "menuItems");
    const menuItemsSnapshot = await getDocs(
      query(menuItemsCollection, where("popular", "==", true))
    );
    return menuItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[];
  } catch (error) {
    console.error("Error getting popular items:", error);
    throw error;
  }
};

export const seedMenuItems = async (menuItems: MenuItem[]): Promise<void> => {
  try {
    for (const item of menuItems) {
      await saveMenuItem(item);
    }
  } catch (error) {
    console.error("Error seeding menu items:", error);
    throw error;
  }
};
