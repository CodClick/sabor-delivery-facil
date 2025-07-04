import { Order } from "@/types/order";

// Definir a sequência natural dos status
const STATUS_SEQUENCE: Order["status"][] = [
  "pending",
  "confirmed", 
  "preparing",
  "ready",
  "delivering",
  "received",
  "delivered"
];

// Sequência específica para desconto em folha
const PAYROLL_DISCOUNT_SEQUENCE: Order["status"][] = [
  "to_deduct",
  "paid"
];

// Status especiais que podem ser aplicados a qualquer momento
const SPECIAL_STATUS: Order["status"][] = ["cancelled", "received"];

// Obter próximos status possíveis com base no status atual
export const getNextStatusOptions = (
  currentStatus: Order["status"], 
  hasReceivedPayment: boolean = false,
  paymentMethod?: Order["paymentMethod"]
): Order["status"][] => {
  // Se o pedido está cancelado ou entregue, não há próximos status
  if (currentStatus === "cancelled" || currentStatus === "delivered") {
    return [];
  }

  // Lógica específica para desconto em folha
  if (paymentMethod === "payroll_discount") {
    // Se está pago, próximo é finalizado (delivered)
    if (currentStatus === "paid") {
      return ["delivered"];
    }
    
    // Se está pendente, próximo é "a descontar"
    if (currentStatus === "pending") {
      return ["to_deduct", "cancelled"];
    }
    
    // Se está "a descontar", próximo é "pago" (SEM cancelar)
    if (currentStatus === "to_deduct") {
      return ["paid"];
    }
    
    // Para outros status no fluxo de desconto em folha, só cancelar
    return ["cancelled"];
  }

  const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus);
  
  // Se não encontrou na sequência, permitir apenas cancelar
  if (currentIndex === -1) {
    return ["cancelled"];
  }

  const nextStatuses: Order["status"][] = [];

  // Lógica especial para quando está "delivering" (saiu para entrega)
  if (currentStatus === "delivering") {
    // Se já recebeu pagamento, próximo é "delivered"
    // Se ainda não recebeu, próximo é "received" 
    if (hasReceivedPayment) {
      nextStatuses.push("delivered");
    } else {
      nextStatuses.push("received");
    }
    nextStatuses.push("cancelled");
    return nextStatuses;
  }

  // Lógica especial para quando está "received" (recebido)
  if (currentStatus === "received") {
    nextStatuses.push("delivered");
    nextStatuses.push("cancelled");
    return nextStatuses;
  }

  // Para outros status, seguir a sequência natural
  const nextIndex = currentIndex + 1;
  if (nextIndex < STATUS_SEQUENCE.length) {
    const nextStatus = STATUS_SEQUENCE[nextIndex];
    
    // Se o próximo seria "received" mas já foi marcado como recebido,
    // pular para "delivered"
    if (nextStatus === "received" && hasReceivedPayment) {
      if (nextIndex + 1 < STATUS_SEQUENCE.length) {
        nextStatuses.push(STATUS_SEQUENCE[nextIndex + 1]); // delivered
      }
    } else {
      nextStatuses.push(nextStatus);
    }
  }

  // Sempre permitir "received" (pagamento) e "cancelled" - mas verificar se já não está recebido
  // Corrigido: só adicionar received se não for um status específico de desconto em folha
  if (currentStatus !== "received" && currentStatus !== "to_deduct" && currentStatus !== "paid" && !hasReceivedPayment) {
    nextStatuses.push("received");
  }
  nextStatuses.push("cancelled");

  return nextStatuses;
};

// Verificar se um status pode ser aplicado ao pedido atual
export const canTransitionToStatus = (
  currentStatus: Order["status"],
  targetStatus: Order["status"],
  hasReceivedPayment: boolean = false,
  paymentMethod?: Order["paymentMethod"]
): boolean => {
  const allowedNextStatuses = getNextStatusOptions(currentStatus, hasReceivedPayment, paymentMethod);
  return allowedNextStatuses.includes(targetStatus);
};

// Obter o próximo status na sequência natural
export const getNextNaturalStatus = (currentStatus: Order["status"]): Order["status"] | null => {
  const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus);
  
  if (currentIndex === -1 || currentIndex === STATUS_SEQUENCE.length - 1) {
    return null;
  }
  
  return STATUS_SEQUENCE[currentIndex + 1];
};

// Verificar se o pedido já recebeu pagamento
export const hasReceivedPayment = (order: Order): boolean => {
  // Verificar se o status atual é "received", "paid" ou se o método de pagamento é cartão ou desconto em folha
  return order.status === "received" || order.status === "paid" || order.paymentMethod === "card" || order.paymentMethod === "payroll_discount";
};

export const getNextStatus = (currentStatus: OrderStatus, payrollDiscount = false): OrderStatus | null => {
  if (payrollDiscount) {
    switch (currentStatus) {
      case "pending":
        return "confirmed";
      case "confirmed":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "to_deduct";
      case "to_deduct":
        return "paid";
      case "paid":
        return null;
      default:
        return null;
    }
  } else {
    switch (currentStatus) {
      case "pending":
        return "confirmed";
      case "confirmed":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "paid";
      case "paid":
        return null;
      default:
        return null;
    }
  }
};

export const getPreviousStatus = (currentStatus: OrderStatus, payrollDiscount = false): OrderStatus | null => {
  if (payrollDiscount) {
    switch (currentStatus) {
      case "confirmed":
        return "pending";
      case "preparing":
        return "confirmed";
      case "ready":
        return "preparing";
      case "to_deduct":
        return "ready";
      case "paid":
        return "to_deduct";
      default:
        return null;
    }
  } else {
    switch (currentStatus) {
      case "confirmed":
        return "pending";
      case "preparing":
        return "confirmed";
      case "ready":
        return "preparing";
      case "paid":
        return "ready";
      default:
        return null;
    }
  }
};
