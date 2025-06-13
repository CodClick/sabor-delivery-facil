import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, CreateOrderRequest, UpdateOrderRequest } from "@/types/order";
import { getAllVariations } from "@/services/variationService";

const ORDERS_COLLECTION = "orders";

// Função para obter o preço adicional da variação
const getVariationPrice = async (variationId: string): Promise<number> => {
  try {
    const variations = await getAllVariations();
    const variation = variations.find(v => v.id === variationId);
    return variation?.additionalPrice || 0;
  } catch (error) {
    console.error("Erro ao obter preço da variação:", error);
    return 0;
  }
};

// Criar um novo pedido
export const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
  try {
    // Calcular o total e montar os itens do pedido
    let total = 0;
    const orderItems = await Promise.all(orderData.items.map(async item => {
      let itemTotal = (item.price || 0) * item.quantity;
      
      // Calcular total das variações
      if (item.selectedVariations) {
        for (const group of item.selectedVariations) {
          for (const variation of group.variations) {
            if (variation.variationId) {
              const additionalPrice = await getVariationPrice(variation.variationId);
              if (additionalPrice > 0) {
                itemTotal += additionalPrice * (variation.quantity || 1) * item.quantity;
              }
            }
          }
        }
      }
      
      total += itemTotal;
      
      return {
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price || 0,
        quantity: item.quantity,
        selectedVariations: item.selectedVariations || []
      };
    }));

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
    
    console.log("Buscando pedidos para hoje:", today.toISOString());
    console.log("Status filtro:", status);
    
    const ordersCollection = collection(db, ORDERS_COLLECTION);
    let q;
    
    if (status && status !== "all") {
      q = query(
        ordersCollection,
        where("createdAt", ">=", todayTimestamp),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        ordersCollection,
        where("createdAt", ">=", todayTimestamp),
        orderBy("createdAt", "desc")
      );
    }
    
    console.log("Executando consulta ao Firestore...");
    
    const ordersSnapshot = await getDocs(q);
    
    console.log("Resultados encontrados (total):", ordersSnapshot.size);
    
    let orders = ordersSnapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        ...data,
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt)
      } as Order;
    });
    
    if (status && status !== "all") {
      orders = orders.filter(order => order.status === status);
      console.log(`Resultados filtrados por status '${status}':`, orders.length);
    }
    
    return orders;
  } catch (error) {
    console.error("Erro ao obter pedidos do dia:", error);
    throw error;
  }
};

// Nova função para obter pedidos por intervalo de datas e status opcional
export const getOrdersByDateRange = async (
  startDate: Date,
  endDate: Date,
  status?: string
): Promise<Order[]> => {
  try {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const startTimestamp = Timestamp.fromDate(start);
    const endTimestamp = Timestamp.fromDate(end);
    
    console.log("Buscando pedidos no intervalo:", start.toISOString(), "até", end.toISOString());
    console.log("Status filtro:", status);
    
    const ordersCollection = collection(db, ORDERS_COLLECTION);
    
    const q = query(
      ordersCollection,
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp),
      orderBy("createdAt", "desc")
    );
    
    console.log("Executando consulta ao Firestore...");
    
    const ordersSnapshot = await getDocs(q);
    
    console.log("Resultados encontrados (total):", ordersSnapshot.size);
    
    let orders = ordersSnapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        ...data,
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt)
      } as Order;
    });
    
    if (status && status !== "all") {
      orders = orders.filter(order => order.status === status);
      console.log(`Resultados filtrados por status '${status}':`, orders.length);
    }
    
    return orders;
  } catch (error) {
    console.error("Erro ao obter pedidos por intervalo de datas:", error);
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
      updatedAt: new Date()
    };
    
    await updateDoc(orderRef, updateData);
    
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
  
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  return new Date().toISOString();
};
