
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByPhone, updateOrder } from "@/services/orderService";
import { Order } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Input } from "@/components/ui/input";
import { Search, Eye, RefreshCw } from "lucide-react";
import OrderDetails from "@/components/OrderDetails";

const Orders = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Efeito para verificar autenticação (opcional)
  useEffect(() => {
    if (currentUser) {
      // Poderia carregar pedidos iniciais se o usuário estiver conectado
    }
  }, [currentUser]);

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      toast({
        title: "Telefone necessário",
        description: "Digite um número de telefone para buscar os pedidos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fetchedOrders = await getOrdersByPhone(searchPhone);
      setOrders(fetchedOrders);
      
      if (fetchedOrders.length === 0) {
        toast({
          title: "Nenhum pedido encontrado",
          description: `Não há pedidos para o telefone ${searchPhone}`,
        });
      } else {
        toast({
          title: "Pedidos encontrados",
          description: `${fetchedOrders.length} pedidos encontrados`,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar os pedidos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const updatedOrder = await updateOrder(orderId, { status: newStatus });
      if (updatedOrder) {
        // Atualizar a lista de pedidos
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        
        // Atualizar o pedido selecionado se estiver aberto
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        
        toast({
          title: "Pedido atualizado",
          description: `Status alterado para ${newStatus}`,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Pedidos</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Voltar para o Cardápio
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Buscar Pedidos</CardTitle>
          <CardDescription>
            Digite o número de telefone do cliente para buscar seus pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Telefone (ex: +5511999999999)"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Encontrados</CardTitle>
            <CardDescription>
              {orders.length} pedidos para o telefone {searchPhone}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Lista de pedidos do cliente</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID do Pedido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>{formatDate(order.createdAt as string)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal para visualização e edição de pedido */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
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

export default Orders;
