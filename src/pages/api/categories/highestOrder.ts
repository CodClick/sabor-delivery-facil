
import { getAllCategories } from "@/services/menuService";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const categories = await getAllCategories();
      const highestOrder = categories.length > 0
        ? Math.max(...categories.map(cat => cat.order !== undefined ? cat.order : 0))
        : -1;
      
      res.status(200).json({ highestOrder });
    } catch (error) {
      console.error("Error fetching highest order:", error);
      res.status(500).json({ error: "Failed to get highest order" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
