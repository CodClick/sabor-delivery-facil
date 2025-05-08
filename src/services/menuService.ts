
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
  orderBy,
  DocumentReference,
  runTransaction,
} from "firebase/firestore";
import { Category, MenuItem, Variation, VariationGroup } from "@/types/menu";

// Menu Items
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

// Categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const categoriesCollection = collection(db, "categories");
    const categoriesSnapshot = await getDocs(
      query(categoriesCollection, orderBy("order", "asc"))
    );
    return categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
  } catch (error) {
    console.error("Error getting categories:", error);
    throw error;
  }
};

export const getCategory = async (id: string): Promise<Category | null> => {
  try {
    const categoryDoc = doc(db, "categories", id);
    const categorySnapshot = await getDoc(categoryDoc);

    if (categorySnapshot.exists()) {
      return {
        id: categorySnapshot.id,
        ...categorySnapshot.data(),
      } as Category;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting category:", error);
    throw error;
  }
};

export const saveCategory = async (category: Category): Promise<string> => {
  try {
    if (category.id) {
      // Update existing category
      const categoryDocRef = doc(db, "categories", category.id);
      // Remove id from the object before updating
      const { id, ...categoryData } = category;
      await updateDoc(categoryDocRef, categoryData);
      return category.id;
    } else {
      // Create new category
      const categoriesCollection = collection(db, "categories");
      const docRef = await addDoc(categoriesCollection, category);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving category:", error);
    throw error;
  }
};

// Alias for saveCategory for better API naming consistency
export const updateCategory = saveCategory;

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const categoryDocRef = doc(db, "categories", id);
    await deleteDoc(categoryDocRef);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Variations
export const getAllVariations = async (): Promise<Variation[]> => {
  try {
    const variationsCollection = collection(db, "variations");
    const variationsSnapshot = await getDocs(query(variationsCollection));
    return variationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Variation[];
  } catch (error) {
    console.error("Error getting variations:", error);
    throw error;
  }
};

export const getVariation = async (id: string): Promise<Variation | null> => {
  try {
    const variationDoc = doc(db, "variations", id);
    const variationSnapshot = await getDoc(variationDoc);

    if (variationSnapshot.exists()) {
      return {
        id: variationSnapshot.id,
        ...variationSnapshot.data(),
      } as Variation;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting variation:", error);
    throw error;
  }
};

// Alias for getVariation for better API naming consistency
export const getVariationById = getVariation;

export const saveVariation = async (variation: Variation): Promise<string> => {
  try {
    if (variation.id) {
      // Update existing variation
      const variationDocRef = doc(db, "variations", variation.id);
      // Remove id from the object before updating
      const { id, ...variationData } = variation;
      await updateDoc(variationDocRef, variationData);
      return variation.id;
    } else {
      // Create new variation
      const variationsCollection = collection(db, "variations");
      const docRef = await addDoc(variationsCollection, variation);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving variation:", error);
    throw error;
  }
};

export const deleteVariation = async (id: string): Promise<void> => {
  try {
    const variationDocRef = doc(db, "variations", id);
    await deleteDoc(variationDocRef);
  } catch (error) {
    console.error("Error deleting variation:", error);
    throw error;
  }
};

// Variation Groups
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

// Seed data functions
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

export const seedCategories = async (categories: Category[]): Promise<void> => {
  try {
    for (const category of categories) {
      await saveCategory(category);
    }
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
};

/**
 * Fixes category ordering by ensuring each category has a unique sequential order value
 * @returns Object containing success status, message, and number of categories updated
 */
export const fixCategoryOrders = async (): Promise<{ 
  success: boolean; 
  message: string; 
  updatedCount: number 
}> => {
  try {
    // Get all categories
    const categoryCollection = collection(db, "categories");
    const categorySnapshot = await getDocs(query(categoryCollection));
    const categories = categorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by current order (with fallback to 0 for undefined order)
    const sortedCategories = [...categories].sort((a: any, b: any) => {
      const orderA = a.order !== undefined ? a.order : 0;
      const orderB = b.order !== undefined ? b.order : 0;
      return orderA - orderB;
    });
    
    // Assign new sequential order values
    const updates = sortedCategories.map(async (category: any, index: number) => {
      if (category.order === index) return null; // Skip if already correct
      
      const categoryRef = doc(db, "categories", category.id);
      return updateDoc(categoryRef, { order: index });
    });
    
    // Execute all updates
    const completedUpdates = await Promise.all(updates.filter(Boolean));
    
    return { 
      success: true, 
      message: 'Category orders updated successfully',
      updatedCount: completedUpdates.length
    };
  } catch (error) {
    console.error('Error fixing category orders:', error);
    throw new Error('Failed to update category orders');
  }
};

// Get the highest order value among categories
export const getHighestCategoryOrder = async (): Promise<number> => {
  try {
    const categories = await getAllCategories();
    if (categories.length === 0) return -1;
    
    const highestOrder = Math.max(...categories.map(cat => 
      typeof cat.order === 'number' ? cat.order : -1
    ));
    
    return highestOrder;
  } catch (error) {
    console.error("Error getting highest category order:", error);
    throw error;
  }
};
