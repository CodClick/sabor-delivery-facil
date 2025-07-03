
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

// Status especiais que podem ser aplicados a qualquer momento
const SPECIAL_STATUS: Order["status"][] = ["cancelled", "received"];

// Obter próximos status possíveis com base no status atual
export const getNextStatusOptions = (
  currentStatus: Order["status"], 
  hasReceivedPayment: boolean = false
): Order["status"][] => {
  // Se o pedido está cancelado ou entregue, não há próximos status
  if (currentStatus === "cancelled" || currentStatus === "delivered") {
    return [];
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
  if (currentStatus !== "received" && !hasReceivedPayment) {
    nextStatuses.push("received");
  }
  nextStatuses.push("cancelled");

  return nextStatuses;
};

// Verificar se um status pode ser aplicado ao pedido atual
export const canTransitionToStatus = (
  currentStatus: Order["status"],
  targetStatus: Order["status"],
  hasReceivedPayment: boolean = false
): boolean => {
  const allowedNextStatuses = getNextStatusOptions(currentStatus, hasReceivedPayment);
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
  // Verificar se o status atual é "received" ou se o método de pagamento é cartão
  return order.status === "received" || order.paymentMethod === "card";
};
