
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariations?: SelectedVariationGroup[];
}

export interface SelectedVariationGroup {
  groupId: string;
  groupName: string;
  variations: SelectedVariation[];
}

export interface SelectedVariation {
  variationId: string;
  quantity: number;
  name?: string;
  additionalPrice?: number;
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
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "received" | "delivered" | "cancelled";
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
    selectedVariations?: SelectedVariationGroup[];
  }[];
}

export interface UpdateOrderRequest {
  status?: "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "received" | "delivered" | "cancelled";
}
