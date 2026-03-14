
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariations?: SelectedVariationGroup[];
  priceFrom?: boolean;
  subtotal?: number;
  isHalfPizza?: boolean;
  combination?: any;
  selectedBorder?: {
    id: string;
    name: string;
    additionalPrice: number;
  };
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
  paymentMethod: "card" | "cash" | "pix" | "payroll_discount";
  observations?: string;
  items: OrderItem[];
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "received" | "delivered" | "cancelled" | "to_deduct" | "paid" | "completed";
  paymentStatus?: "a_receber" | "recebido";
  total: number;
  subtotal?: number;
  frete?: number;
  discount?: number;
  couponCode?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  cancellationReason?: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: "card" | "cash" | "pix" | "payroll_discount";
  observations?: string;
  status?: "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "received" | "delivered" | "cancelled" | "to_deduct" | "paid" | "completed";
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    selectedVariations?: SelectedVariationGroup[];
    selectedBorder?: {
      id: string;
      name: string;
      additionalPrice: number;
    } | null;
    priceFrom?: boolean;
    subtotal?: number;
    isHalfPizza?: boolean;
    combination?: any;
  }[];
  total?: number;
  subtotal?: number;
  frete?: number;
  discount?: number;
  couponCode?: string | null;
}

export interface UpdateOrderRequest {
  status?: "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "received" | "delivered" | "cancelled" | "to_deduct" | "paid" | "completed";
  paymentStatus?: "a_receber" | "recebido";
}
