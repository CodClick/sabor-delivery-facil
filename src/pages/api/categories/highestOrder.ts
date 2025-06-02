
import { Request, Response } from 'express';
import { getHighestCategoryOrder } from '@/services/categoryService';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const highestOrder = await getHighestCategoryOrder();
    res.status(200).json({ highestOrder });
  } catch (error) {
    console.error('Error getting highest category order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
