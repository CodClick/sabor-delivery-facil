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
  
  // Inicializar o intervalo de datas com o dia atual
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: today,
    to: today
  });

  // Função para carregar pedidos
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
      
      console.log("Carregando pedidos com status:", status);
      console.log("Intervalo de datas:", startDate, "até", endDate);
      
      const orders = await getOrdersByDateRange(startDate, endDate, status === "all" ? undefined : status);
      console.log("Pedidos carregados:", orders.length);
      
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

  // Efeito para carregar pedidos quando o status ou intervalo de datas muda
  useEffect(() => {
    loadOrders(activeStatus, dateRange);
    
    // Configurar listener em tempo real para novos pedidos no intervalo selecionado
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
      
      // Configurar listener
      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          // Se houver novas mudanças, recarregar os pedidos
          if (!snapshot.empty) {
            loadOrders(activeStatus, dateRange);
          }
          
          // Mostrar notificação para novos pedidos
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              // Verificar se é um pedido novo (menos de 10 segundos)
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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const updatedOrder = await updateOrder(orderId, { status: newStatus });
      
      // Update local state to reflect the change
      if (updatedOrder) {
        // Atualizar o pedido na lista local se o status ainda corresponder ao filtro
        if (activeStatus === "all" || updatedOrder.status === activeStatus) {
          setOrders(prev => 
            prev.map(order => order.id === orderId ? updatedOrder : order)
          );
        } else {
          // Remover o pedido da lista se não corresponder mais ao filtro
          setOrders(prev => prev.filter(order => order.id !== orderId));
        }
        
        // Atualizar o pedido selecionado se estiver aberto
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
      }
      
      toast({
        title: "Pedido atualizado",
        description: `Status alterado para ${translateStatus(newStatus)}`,
      });
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
      cancelled: "Cancelado"
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
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Função atualizada para formatar data completa
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
  
  // Status options for the dropdown - filter out any with empty values
  const statusOptions = [
    { value: "all", label: "Todos" },
    { value: "pending", label: "Pendentes" },
    { value: "confirmed", label: "Aceitos" },
    { value: "preparing", label: "Em Produção" },
    { value: "ready", label: "Prontos" },
    { value: "delivering", label: "Em Entrega" },
    { value: "received", label: "Recebidos" },
    { value: "delivered", label: "Finalizados" },
    { value: "cancelled", label: "Cancelados" }
  ].filter(option => option.value && option.value.trim() !== '');

  const handleRetryLoad = () => {
    loadOrders(activeStatus, dateRange);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Pedidos</h1>
        <Button onClick={() => navigate("/admin")} variant="outline">
          Voltar para o Cardápio
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

      {loading ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-gray-500">Carregando pedidos...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={handleRetryLoad} 
              variant="outline" 
              className="mt-4"
            >
              Tentar novamente
            </Button>
            <Button 
              onClick={() => {
                setActiveStatus("all");
                const today = new Date();
                setDateRange({from: today, to: today});
                loadOrders("all", {from: today, to: today});
              }} 
              variant="outline" 
              className="mt-2"
            >
              Voltar para todos os pedidos de hoje
            </Button>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-gray-500">Nenhum pedido encontrado para o período e status selecionados.</p>
            <Button 
              onClick={() => {
                setActiveStatus("all");
                const today = new Date();
                setDateRange({from: today, to: today});
                loadOrders("all", {from: today, to: today});
              }} 
              variant="outline" 
              className="mt-4"
            >
              Ver todos os pedidos de hoje
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
