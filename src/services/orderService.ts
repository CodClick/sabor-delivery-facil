
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, CreateOrderRequest, UpdateOrderRequest } from "@/types/order";
import { menuItems } from "@/data/menuData";

const ORDERS_COLLECTION = "orders";

// Criar um novo pedido
export const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
  try {
    // Calcular o total e montar os itens do pedido
    let total = 0;
    const orderItems = orderData.items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (!menuItem) throw new Error(`Item do menu com ID ${item.menuItemId} não encontrado`);
      
      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;
      
      return {
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      };
    });

    // Criar o documento do pedido
    const orderToSave = {
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      items: orderItems,
      status: "pending",
      total,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderToSave);
    
    return {
      id: docRef.id,
      ...orderToSave,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Order;
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    throw error;
  }
};

// Obter um pedido pelo ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) return null;
    
    const orderData = orderSnap.data();
    return {
      id: orderSnap.id,
      ...orderData,
      createdAt: formatTimestamp(orderData.createdAt),
      updatedAt: formatTimestamp(orderData.updatedAt)
    } as Order;
  } catch (error) {
    console.error("Erro ao obter pedido:", error);
    throw error;
  }
};

// Obter pedidos por número de telefone
export const getOrdersByPhone = async (phone: string): Promise<Order[]> => {
  try {
    const ordersCollection = collection(db, ORDERS_COLLECTION);
    const q = query(
      ordersCollection, 
      where("customerPhone", "==", phone),
      orderBy("createdAt", "desc")
    );
    
    const ordersSnapshot = await getDocs(q);
    return ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt)
      } as Order;
    });
  } catch (error) {
    console.error("Erro ao obter pedidos por telefone:", error);
    throw error;
  }
};

// Atualizar um pedido
export const updateOrder = async (orderId: string, updates: UpdateOrderRequest): Promise<Order | null> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) return null;
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(orderRef, updateData);
    
    // Obter o pedido atualizado
    return getOrderById(orderId);
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    throw error;
  }
};

// Função auxiliar para formatar timestamps do Firestore
const formatTimestamp = (timestamp: Timestamp): string => {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  return timestamp.toDate().toISOString();
};
