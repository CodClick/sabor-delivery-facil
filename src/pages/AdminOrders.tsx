import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateOrder, getOrdersByDateRange } from "@/services/orderService";
import OrderDetails from "@/components/OrderDetails";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/DateRangePicker";

const AdminOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: today,
    to: today
  });

  const loadOrders = async (status: string, dateRange: DateRange | undefined) => {
    try {
      setLoading(true);
      setError(null);

      if (!dateRange?.from) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const startDate = dateRange.from;
      const endDate = dateRange.to || dateRange.from;

      const orders = await getOrdersByDateRange(startDate, endDate, status === "all" ? undefined : status);
      setOrders(orders);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
      setError("Não foi possível carregar os pedidos. Tente novamente.");
      setLoading(false);

      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadOrders(activeStatus, dateRange);

    if (dateRange?.from) {
      const start = new Date(dateRange.from);
      start.setHours(0, 0, 0, 0);

      const end = new Date(dateRange.to || dateRange.from);
      end.setHours(23, 59, 59, 999);

      const startTimestamp = Timestamp.fromDate(start);
      const endTimestamp = Timestamp.fromDate(end);

      const ordersRef = collection(db, "orders");
      const ordersQuery = query(
        ordersRef,
        where("createdAt", ">=", startTimestamp),
        where("createdAt", "<=", endTimestamp),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            loadOrders(activeStatus, dateRange);
          }

          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              const createdAt = data.createdAt?.toDate() || new Date();
              const isRecent = (new Date().getTime() - createdAt.getTime()) < 10000;

              if (isRecent && data.status === "pending") {
                toast({
                  title: "Novo pedido recebido!",
                  description: `Cliente: ${data.customerName}`,
                });
              }
            }
          });
        },
        (err) => {
          console.error("Erro no listener:", err);
          toast({
            title: "Erro",
            description: "Não foi possível monitorar novos pedidos.",
            variant: "destructive",
          });
        }
      );

      return () => unsubscribe();
    }
  }, [activeStatus, dateRange, toast]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleUpdateOrderStatus = async (
    orderId: string, 
    newStatus?: Order["status"], 
    cancellationReason?: string, 
    paymentStatus?: "a_receber" | "recebido"
  ) => {
    try {
      console.log("AdminOrders - Atualizando pedido:", { orderId, newStatus, paymentStatus });
      
      // Preparar objeto de atualização
      const updateData: any = {};
      
      if (newStatus) {
        updateData.status = newStatus;
      }
      
      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      const updatedOrder = await updateOrder(orderId, updateData);

      if (updatedOrder) {
        // Atualizar a lista de pedidos
        setOrders(prev =>
          prev.map(order => order.id === orderId ? updatedOrder : order)
        );

        // Atualizar o pedido selecionado se for o mesmo
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updatedOrder);
        }

        const statusMessage = newStatus ? 
          `Status alterado para ${translateStatus(newStatus)}` :
          `Status de pagamento alterado para ${paymentStatus === "recebido" ? "Recebido" : "A Receber"}`;

        toast({
          title: "Pedido atualizado",
          description: statusMessage,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o pedido. Tente novamente.",
        variant: "destructive",
      });
    }
  };

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

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const statusOptions = [
    { value: "all", label: "Todos" },
    { value: "pending", label: "Pendentes" },
    { value: "confirmed", label: "Aceitos" },
    { value: "preparing", label: "Em Produção" },
    { value: "ready", label: "Prontos" },
    { value: "delivering", label: "Em Entrega" },
    { value: "received", label: "Recebidos" },
    { value: "delivered", label: "Finalizados" },
    { value: "cancelled", label: "Cancelados" },
    { value: "to_deduct", label: "A descontar" },
    { value: "paid", label: "Pagos" }
  ];

  const handleRetryLoad = () => {
    loadOrders(activeStatus, dateRange);
  };

  // Calculate summary statistics
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Pedidos</h1>
        <Button onClick={() => navigate("/admin-dashboard")} variant="outline">
          Pagina de Administração
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Filtrar por status:</label>
            <Select value={activeStatus} onValueChange={setActiveStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Filtrar por período:</label>
            <DateRangePicker 
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 py-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Pedido #{order.id.substring(0, 6)}
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatFullDate(order.createdAt as string)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs flex items-center ${getStatusColor(order.status)}`}>
                  {translateStatus(order.status)}
                </span>
              </div>
              <div className="mt-2">
                <div className="font-semibold">{order.customerName}</div>
                <div className="text-sm text-gray-500">{order.customerPhone}</div>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Itens: {order.items.length}</p>
                <p className="font-medium">Total: R$ {order.total.toFixed(2)}</p>
                <Button 
                  onClick={() => handleViewOrder(order)} 
                  variant="outline"
                  className="w-full mt-2"
                >
                  Ver detalhes
                </Button>
                {order.status !== "received" && order.status !== "delivered" && (
                  <Button
                    onClick={() => {
                      const novoStatus = order.status === "delivering" ? "delivered" : "received";
                      handleUpdateOrderStatus(order.id, novoStatus);
                    }}
                    variant="secondary"
                    className="w-full mt-2"
                  >
                    ✅ Marcar como Recebido
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg border-t-4 border-blue-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total de Pedidos no Período</p>
            <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Valor Total das Vendas</p>
            <p className="text-2xl font-bold text-green-600">R$ {totalSales.toFixed(2)}</p>
          </div>
        </div>
        {dateRange?.from && (
          <div className="text-center mt-2 text-sm text-gray-500">
            Período: {dateRange.from.toLocaleDateString('pt-BR')} 
            {dateRange.to && dateRange.to !== dateRange.from && ` até ${dateRange.to.toLocaleDateString('pt-BR')}`}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription>
              Visualize e atualize o status do pedido
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <OrderDetails 
              order={selectedOrder} 
              onUpdateStatus={handleUpdateOrderStatus} 
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
