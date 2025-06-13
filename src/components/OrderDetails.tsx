import React from "react";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardList,
  CheckCircle2,
  ChefHat,
  Package,
  Truck,
  XCircle,
  Check
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
      confirmed: "Aceito",
      preparing: "Em produção",
      ready: "Pronto para Entrega",
      delivering: "Saiu para entrega",
      received: "Recebido",
      delivered: "Entrega finalizada",
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
      case "delivering": return "bg-blue-100 text-blue-800";
      case "received": return "bg-blue-200 text-blue-800";
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
      ready: ["delivering", "cancelled"],
      delivering: ["received", "cancelled"],
      received: ["delivered", "cancelled"],
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
      case "delivering": return <Truck className="h-5 w-5" />;
      case "received": return <Check className="h-5 w-5" />;
      case "delivered": return <CheckCircle2 className="h-5 w-5" />;
      case "cancelled": return <XCircle className="h-5 w-5" />;
      default: return <ClipboardList className="h-5 w-5" />;
    }
  };

  // Calcular subtotal do item incluindo variações
  const calculateItemSubtotal = (item: any) => {
    console.log("Calculando subtotal para item:", item);
    
    let basePrice = (item.price || 0) * item.quantity;
    let variationsTotal = 0;
    
    if (item.selectedVariations && Array.isArray(item.selectedVariations)) {
      console.log("Variações encontradas:", item.selectedVariations);
      
      item.selectedVariations.forEach((group: any) => {
        console.log("Processando grupo:", group);
        
        if (group.variations && Array.isArray(group.variations)) {
          group.variations.forEach((variation: any) => {
            console.log("Processando variação:", variation);
            
            const additionalPrice = variation.additionalPrice || 0;
            const quantity = variation.quantity || 1;
            
            if (additionalPrice > 0) {
              const variationCost = additionalPrice * quantity * item.quantity;
              variationsTotal += variationCost;
              console.log(`Variação ${variation.name}: R$ ${additionalPrice} x ${quantity} x ${item.quantity} = R$ ${variationCost}`);
            }
          });
        }
      });
    }
    
    const total = basePrice + variationsTotal;
    console.log(`Subtotal final: Base R$ ${basePrice} + Variações R$ ${variationsTotal} = R$ ${total}`);
    
    return total;
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
        <div className="col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
          <p className="mt-1">{order.address}</p>
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
        {order.observations && (
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Observações</h3>
            <p className="mt-1">{order.observations}</p>
          </div>
        )}
      </div>

      {/* Debug do pedido completo */}
      {console.log("Pedido completo:", order)}
      {console.log("Itens do pedido:", order.items)}

      {/* Itens do pedido */}
      <div>
        <h3 className="text-md font-medium mb-2">Itens do Pedido</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Preço Base</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item, index) => {
              console.log(`\n=== ITEM ${index + 1} ===`);
              console.log("Item completo:", JSON.stringify(item, null, 2));
              console.log("Tem selectedVariations?", !!item.selectedVariations);
              console.log("selectedVariations é array?", Array.isArray(item.selectedVariations));
              console.log("Quantidade de grupos:", item.selectedVariations?.length || 0);
              
              return (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        
                        {/* Exibir variações se existirem */}
                        {item.selectedVariations && Array.isArray(item.selectedVariations) && item.selectedVariations.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {item.selectedVariations.map((group, groupIndex) => {
                              console.log(`Grupo ${groupIndex}:`, JSON.stringify(group, null, 2));
                              
                              return (
                                <div key={groupIndex} className="text-sm border-l-2 border-gray-200 pl-3">
                                  <div className="font-medium text-gray-700 mb-1">
                                    {group.groupName || `Grupo ${groupIndex + 1}`}:
                                  </div>
                                  <div className="space-y-1">
                                    {group.variations && Array.isArray(group.variations) && group.variations.length > 0 ? (
                                      group.variations.map((variation, varIndex) => {
                                        console.log(`Variação ${varIndex}:`, JSON.stringify(variation, null, 2));
                                        
                                        const additionalPrice = variation.additionalPrice || 0;
                                        const quantity = variation.quantity || 1;
                                        const variationTotal = additionalPrice * quantity;
                                        
                                        return (
                                          <div key={varIndex} className="flex justify-between items-center text-gray-600">
                                            <span>
                                              • {variation.name || `Variação ${varIndex + 1}`}
                                              {quantity > 1 && ` (${quantity}x)`}
                                            </span>
                                            {additionalPrice > 0 && (
                                              <span className="text-green-600 font-medium">
                                                +R$ {variationTotal.toFixed(2)}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <div className="text-gray-500 italic">
                                        Nenhuma variação no grupo: {JSON.stringify(group.variations)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 mt-1">
                            (Sem variações selecionadas)
                            <br />
                            <span className="text-xs">Debug: {JSON.stringify(item.selectedVariations)}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>R$ {(item.price || 0).toFixed(2)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="font-medium">R$ {calculateItemSubtotal(item).toFixed(2)}</TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
              <TableCell className="font-bold">R$ {order.total.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
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
