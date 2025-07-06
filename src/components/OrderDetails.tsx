import React, { useState } from "react";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getNextStatusOptions } from "@/services/orderStatusService";

interface OrderDetailsProps {
  order: Order;
  onUpdateStatus?: (
    orderId: string, 
    newStatus?: Order["status"], 
    cancellationReason?: string, 
    paymentStatus?: "a_receber" | "recebido"
  ) => void;
}

const OrderDetails = ({ order, onUpdateStatus }: OrderDetailsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const translateStatus = (status: Order["status"]) => {
    const statusMap: Record<Order["status"], string> = {
      pending: "Pendente",
      confirmed: "Aceito",
      preparing: "Em produção",
      ready: "Pronto para Entrega",
      delivering: "Saiu para entrega",
      received: "Recebido",
      delivered: "Entrega finalizada",
      cancelled: "Cancelado",
      to_deduct: "A descontar",
      paid: "Pago"
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-purple-100 text-purple-800";
      case "ready": return "bg-green-100 text-green-800";
      case "delivering": return "bg-blue-100 text-blue-800";
      case "received": return "bg-blue-200 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "to_deduct": return "bg-orange-100 text-orange-800";
      case "paid": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (newStatus: Order["status"]) => {
    if (!onUpdateStatus) return;
    
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async () => {
    if (!onUpdateStatus) return;
    
    setIsUpdating(true);
    try {
      const newPaymentStatus = order.paymentStatus === "recebido" ? "a_receber" : "recebido";
      await onUpdateStatus(order.id, undefined, undefined, newPaymentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('pt-BR');
  };

  // Verificar se é um pedido do PDV (assumindo que PDV orders não têm userId definido)
  const isPDVOrder = !order.userId;
  
  const nextStatusOptions = getNextStatusOptions(
    order.status, 
    order.paymentStatus === "recebido", 
    order.paymentMethod,
    isPDVOrder
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            Pedido #{order.id.substring(0, 6)}
            {isPDVOrder && <span className="text-sm text-blue-600 ml-2">(PDV)</span>}
          </h3>
          <p className="text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {translateStatus(order.status)}
        </Badge>
      </div>

      {/* Customer Info */}
      <div className="space-y-2">
        <h4 className="font-medium">Informações do Cliente</h4>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Nome:</span> {order.customerName}</p>
          <p><span className="font-medium">Telefone:</span> {order.customerPhone}</p>
          <p><span className="font-medium">Endereço:</span> {order.address}</p>
          <p><span className="font-medium">Pagamento:</span> {
            order.paymentMethod === "card" ? "Cartão" :
            order.paymentMethod === "cash" ? "Dinheiro" :
            order.paymentMethod === "pix" ? "PIX" :
            order.paymentMethod === "payroll_discount" ? "Desconto em Folha" :
            order.paymentMethod
          }</p>
        </div>
      </div>

      <Separator />

      {/* Items */}
      <div className="space-y-2">
        <h4 className="font-medium">Itens do Pedido</h4>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-start text-sm border-b pb-2">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-600">Qtd: {item.quantity}</p>
                {item.selectedVariations && item.selectedVariations.length > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    {item.selectedVariations.map(group => (
                      <div key={group.groupId}>
                        {group.groupName}: {group.variations.map(v => v.name).join(', ')}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center font-bold text-lg pt-2">
          <span>Total:</span>
          <span>R$ {order.total.toFixed(2)}</span>
        </div>
      </div>

      <Separator />

      {/* Status Actions */}
      <div className="space-y-4">
        <h4 className="font-medium">Ações do Pedido</h4>
        
        {/* Status Progression Buttons */}
        <div className="flex flex-wrap gap-2">
          {nextStatusOptions.map(status => (
            <Button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isUpdating}
              variant={status === "cancelled" ? "destructive" : "default"}
              size="sm"
            >
              {status === "cancelled" ? "Cancelar Pedido" : `Marcar como ${translateStatus(status)}`}
            </Button>
          ))}
        </div>

        {/* Payment Status Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status de Pagamento</label>
          <div className="flex items-center gap-3">
            <Badge variant={order.paymentStatus === "recebido" ? "default" : "secondary"}>
              {order.paymentStatus === "recebido" ? "Recebido" : "A Receber"}
            </Badge>
            <Button
              onClick={handlePaymentStatusChange}
              variant={order.paymentStatus === "recebido" ? "outline" : "default"}
              size="sm"
              disabled={isUpdating}
            >
              {order.paymentStatus === "recebido" ? "Marcar como A Receber" : "Marcar como Recebido"}
            </Button>
          </div>
        </div>
      </div>

      {/* Observations */}
      {order.observations && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium">Observações</h4>
            <p className="text-sm text-gray-600">{order.observations}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetails;
