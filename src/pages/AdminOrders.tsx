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
import { supabase } from "@/integrations/supabase/client"; // ✅ import correto do Supabase

const AdminOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codigoCurto, setCodigoCurto] = useState(""); // ✅ novo estado para busca

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
          const newOrders: Order[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
            } as Order;
          });

          setOrders(newOrders);

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

  // 🔍 Busca por código curto
  const handleSearchByCodigoCurto = async (codigoCurto: string) => {
    if (!codigoCurto) {
      loadOrders(activeStatus, dateRange);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pedidos_sabor_delivery")
        .select("codigo_pedido")
        .ilike("codigo_curto", codigoCurto.trim().toUpperCase())
        .single();

      if (error || !data) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const pedidoId = data.codigo_pedido;

      const ordersRef = collection(db, "orders");
      const pedidoQuery = query(ordersRef, where("codigo_pedido", "==", pedidoId));

      const unsubscribe = onSnapshot(pedidoQuery, (snapshot) => {
        const results: Order[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(results);
      });

      setLoading(false);
      return () => unsubscribe();
    } catch (err) {
      console.error("Erro ao buscar código curto:", err);
      setLoading(false);
    }
  };

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
      const updateData: any = {};
      if (newStatus) updateData.status = newStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;

      const updatedOrder = await updateOrder(orderId, updateData);

      if (updatedOrder) {
        setOrders(prev =>
          prev.map(order => order.id === orderId ? updatedOrder : order)
        );

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updatedOrder);
        }

        const statusMessage = newStatus
          ? `Status alterado para ${translateStatus(newStatus)}`
          : `Status de pagamento alterado para ${paymentStatus === "recebido" ? "Recebido" : "A Receber"}`;

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

  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Pedidos</h1>
      </div>
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate("/admin-dashboard")} variant="outline">
          Página de Administração
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Filtro por status */}
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

          {/* Filtro por período */}
          <div>
            <label className="text-sm font-medium mb-2 block">Filtrar por período:</label>
            <DateRangePicker 
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              className="w-full"
            />
          </div>

          {/* Filtro por número do pedido */}
          <div>
            <label className="text-sm font-medium mb-2 block">Buscar por número do pedido:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: CP-431..."
                value={codigoCurto}
                onChange={(e) => {
                  const value = e.target.value;
                  setCodigoCurto(value);
                  if (value.length >= 2 || value.length === 0) {
                    handleSearchByCodigoCurto(value);
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {codigoCurto && (
                <button
                  onClick={() => {
                    setCodigoCurto("");
                    handleSearchByCodigoCurto("");
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resto do código da renderização dos cards de pedidos permanece igual */}
      ...
    </div>
  );
};

export default AdminOrders;
