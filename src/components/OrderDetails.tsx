
import React from "react";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  CheckCircle2,
  ChefHat,
  Package,
  Truck,
  XCircle
} from "lucide-react";

interface OrderDetailsProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onUpdateStatus }) => {
  // Traduzir status para português
  const translateStatus = (status: Order["status"]) => {
    const statusMap: Record<Order["status"], string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      preparing: "Preparando",
      ready: "Pronto",
      delivered: "Entregue",
      cancelled: "Cancelado"
    };
    return statusMap[status] || status;
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Obter classe de cor com base no status
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-purple-100 text-purple-800";
      case "ready": return "bg-green-100 text-green-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Definir próximos status possíveis com base no status atual
  const getNextStatusOptions = (currentStatus: Order["status"]) => {
    const statusFlow: Record<Order["status"], Order["status"][]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready", "cancelled"],
      ready: ["delivered", "cancelled"],
      delivered: [],
      cancelled: []
    };
    return statusFlow[currentStatus] || [];
  };

  // Obter ícone para cada status
  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending": return <ClipboardList className="h-5 w-5" />;
      case "confirmed": return <CheckCircle2 className="h-5 w-5" />;
      case "preparing": return <ChefHat className="h-5 w-5" />;
      case "ready": return <Package className="h-5 w-5" />;
      case "delivered": return <Truck className="h-5 w-5" />;
      case "cancelled": return <XCircle className="h-5 w-5" />;
      default: return <ClipboardList className="h-5 w-5" />;
    }
  };

  // Lista de botões para atualização de status
  const nextStatusButtons = getNextStatusOptions(order.status).map(status => {
    const icon = getStatusIcon(status);
    const label = translateStatus(status);
    
    return (
      <Button
        key={status}
        onClick={() => onUpdateStatus(order.id, status)}
        variant={status === "cancelled" ? "destructive" : "default"}
        className="flex items-center gap-1"
      >
        {icon}
        {label}
      </Button>
    );
  });

  return (
    <div className="space-y-6">
      {/* Informações básicas do pedido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">ID do Pedido</h3>
          <p className="mt-1">{order.id}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Data do Pedido</h3>
          <p className="mt-1">{formatDate(order.createdAt as string)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
          <p className="mt-1">{order.customerName}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
          <p className="mt-1">{order.customerPhone}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Total</h3>
          <p className="mt-1 font-semibold">R$ {order.total.toFixed(2)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <p className="mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              {translateStatus(order.status)}
            </span>
          </p>
        </div>
      </div>

      {/* Itens do pedido */}
      <div>
        <h3 className="text-md font-medium mb-2">Itens do Pedido</h3>
        <div className="rounded-md border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">Total</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">R$ {order.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Botões de atualização de status */}
      {nextStatusButtons.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-2">Atualizar Status</h3>
          <div className="flex flex-wrap gap-2">
            {nextStatusButtons}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
