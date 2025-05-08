
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, doc, updateDoc } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
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
    await Promise.all(updates.filter(Boolean));
    
    return res.status(200).json({ 
      success: true, 
      message: 'Category orders updated successfully',
      updatedCount: updates.filter(Boolean).length
    });
  } catch (error) {
    console.error('Error fixing category orders:', error);
    return res.status(500).json({ error: 'Failed to update category orders' });
  }
}
