
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, CreateOrderRequest, UpdateOrderRequest } from "@/types/order";

const ORDERS_COLLECTION = "orders";

// Criar um novo pedido
export const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
  try {
    // Calcular o total e montar os itens do pedido
    let total = 0;
    const orderItems = orderData.items.map(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      return {
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      };
    });

    // Criar o documento do pedido sem referência ao usuário atual
    // Isso evita erros de permissão quando não há autenticação
    const orderToSave = {
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      address: orderData.address,
      paymentMethod: orderData.paymentMethod,
      observations: orderData.observations || "",
      items: orderItems,
      status: "pending",
      total,
      createdAt: new Date(),  // Usando Date() diretamente ao invés de serverTimestamp()
      updatedAt: new Date()   // Isso ajuda a evitar problemas de permissão
    };

    // Usar o método try/catch para capturar erros específicos de permissão
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
    
    const orderData = orderSnap.data() as Record<string, any>;
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
      const data = doc.data() as Record<string, any>;
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

// Obter todos os pedidos de hoje com filtro opcional de status
export const getTodayOrders = async (status?: string): Promise<Order[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);
    
    const ordersCollection = collection(db, ORDERS_COLLECTION);
    let q;
    
    if (status && status !== "all") {
      q = query(
        ordersCollection,
        where("createdAt", ">=", todayTimestamp),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        ordersCollection,
        where("createdAt", ">=", todayTimestamp),
        orderBy("createdAt", "desc")
      );
    }
    
    const ordersSnapshot = await getDocs(q);
    return ordersSnapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        ...data,
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt)
      } as Order;
    });
  } catch (error) {
    console.error("Erro ao obter pedidos do dia:", error);
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
      updatedAt: new Date()  // Usar Date() em vez de serverTimestamp() para evitar problemas de permissão
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
const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  
  // Verifica se o timestamp é um objeto Firestore Timestamp
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  // Se for um objeto Date
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  return new Date().toISOString();
};
