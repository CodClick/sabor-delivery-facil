
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateOrder } from "@/services/orderService";
import OrderDetails from "@/components/OrderDetails";

const AdminOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Get today's date at midnight for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Convert to Firestore Timestamp
    const todayTimestamp = Timestamp.fromDate(today);
    
    const ordersRef = collection(db, "orders");
    let ordersQuery;
    
    if (activeTab === "all") {
      // All orders from today, ordered by creation time (newest first)
      ordersQuery = query(
        ordersRef,
        where("createdAt", ">=", todayTimestamp),
        orderBy("createdAt", "desc")
      );
    } else {
      // Filter by status and today's date
      ordersQuery = query(
        ordersRef,
        where("createdAt", ">=", todayTimestamp),
        where("status", "==", activeTab),
        orderBy("createdAt", "desc")
      );
    }
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      ordersQuery, 
      (snapshot) => {
        const ordersList: Order[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          ordersList.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
          } as Order);
        });
        setTodayOrders(ordersList);
        
        // Show notification for new orders when in pending tab or all tab
        if (activeTab === "pending" || activeTab === "all") {
          const newOrders = ordersList.filter(
            order => order.status === "pending" && 
            new Date(order.createdAt as string).getTime() > Date.now() - 10000 // 10 seconds ago
          );
          
          if (newOrders.length > 0) {
            toast({
              title: "Novo pedido recebido!",
              description: `${newOrders.length} novo(s) pedido(s) pendente(s)`,
            });
          }
        }
      },
      (error) => {
        console.error("Error getting orders: ", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os pedidos",
          variant: "destructive",
        });
      }
    );
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [activeTab, toast]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const updatedOrder = await updateOrder(orderId, { status: newStatus });
      if (updatedOrder && selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Pedidos</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Voltar para o Cardápio
        </Button>
      </div>

      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full mb-6"
      >
        <TabsList className="w-full grid grid-cols-4 md:grid-cols-8 mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="confirmed">Aceitos</TabsTrigger>
          <TabsTrigger value="preparing">Em Produção</TabsTrigger>
          <TabsTrigger value="ready">Prontos</TabsTrigger>
          <TabsTrigger value="delivering">Em Entrega</TabsTrigger>
          <TabsTrigger value="received">Recebidos</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {todayOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <p className="text-gray-500">Nenhum pedido encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 py-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Pedido #{order.id.substring(0, 6)} • {formatDate(order.createdAt as string)}
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
        </TabsContent>
      </Tabs>

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
