
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: "card" | "cash";
  observations?: string;
  items: OrderItem[];
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  total: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: "card" | "cash";
  observations?: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface UpdateOrderRequest {
  status?: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
}
