import React, { useState, useEffect } from "react"; import { useNavigate } from "react-router-dom"; import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore"; import { db } from "@/lib/firebase"; import { Order } from "@/types/order"; import { useToast } from "@/hooks/use-toast"; import { DateRange } from "react-day-picker"; import { Card, CardContent, CardHeader, } from "@/components/ui/card"; import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog"; import { Button } from "@/components/ui/button"; import { updateOrder, getOrdersByDateRange } from "@/services/orderService"; import OrderDetails from "@/components/OrderDetails"; import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"; import { DateRangePicker } from "@/components/DateRangePicker";

const AdminOrders = () => { const navigate = useNavigate(); const { toast } = useToast(); const [orders, setOrders] = useState<Order[]>([]); const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); const [dialogOpen, setDialogOpen] = useState(false); const [activeStatus, setActiveStatus] = useState("all"); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);

const today = new Date(); const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: today, to: today });

const loadOrders = async (status: string, dateRange: DateRange | undefined) => { try { setLoading(true); setError(null);

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

useEffect(() => { loadOrders(activeStatus, dateRange);

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
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const orderId = change.doc.id;

        if (change.type === "added") {
          const createdAt = data.createdAt?.toDate?.() || new Date();
          const isRecent = new Date().getTime() - createdAt.getTime() < 10000;

          if (isRecent && data.status === "pending") {
            toast({
              title: "Novo pedido recebido!",
              description: `Cliente: ${data.customerName}`,
            });
          }
          loadOrders(activeStatus, dateRange);
        }

        if (change.type === "modified") {
          const normalizedData = {
            ...data,
            createdAt: data.createdAt?.toDate().toISOString?.() ?? data.createdAt,
          };

          setOrders((prev) =>
            prev.map((order) =>
              order.id === orderId ? { ...order, ...normalizedData } : order
            )
          );

          if (selectedOrder?.id === orderId) {
            setSelectedOrder((prev) =>
              prev ? { ...prev, ...normalizedData } : prev
            );
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

const handleDateRangeChange = (range: DateRange | undefined) => { setDateRange(range); };

const handleViewOrder = (order: Order) => { setSelectedOrder(order); setDialogOpen(true); };

const handleUpdateOrderStatus = async ( orderId: string, newStatus?: Order["status"], cancellationReason?: string, paymentStatus?: "a_receber" | "recebido" ) => { try { const updateData: any = {}; if (newStatus) updateData.status = newStatus; if (paymentStatus) updateData.paymentStatus = paymentStatus;

const updatedOrder = await updateOrder(orderId, updateData);

  if (updatedOrder) {
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

const translateStatus = (status: Order["status"]) => { const statusMap: Record<Order["status"], string> = { pending: "Pendente", confirmed: "Aceito", preparing: "Em produção", ready: "Pronto para Entrega", delivering: "Saiu para entrega", received: "Recebido", delivered: "Entrega finalizada", cancelled: "Cancelado", to_deduct: "A descontar", paid: "Pago" }; return statusMap[status] || status; };

const getStatusColor = (status: Order["status"]) => { switch (status) { case "pending": return "bg-yellow-100 text-yellow-800"; case "confirmed": return "bg-blue-100 text-blue-800"; case "preparing": return "bg-purple-100 text-purple-800"; case "ready": return "bg-green-100 text-green-800"; case "delivering": return "bg-blue-100 text-blue-800"; case "received": return "bg-blue-200 text-blue-800"; case "delivered": return "bg-green-100 text-green-800"; case "cancelled": return "bg-red-100 text-red-800"; case "to_deduct": return "bg-orange-100 text-orange-800"; case "paid": return "bg-blue-100 text-blue-800"; default: return "bg-gray-100 text-gray-800"; } };

const formatFullDate = (input: string | Date | Timestamp) => { let date: Date; if (input instanceof Timestamp) { date = input.toDate(); } else if (typeof input === "string") { date = new Date(input); } else { date = input; } if (isNaN(date.getTime())) return "Data inválida"; return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date); };

const statusOptions = [ { value: "all", label: "Todos" }, { value: "pending", label: "Pendentes" }, { value: "confirmed", label: "Aceitos" }, { value: "preparing", label: "Em Produção" }, { value: "ready", label: "Prontos" }, { value: "delivering", label: "Em Entrega" }, { value: "received", label: "Recebidos" }, { value: "delivered", label: "Finalizados" }, { value: "cancelled", label: "Cancelados" }, { value: "to_deduct", label: "A descontar" }, { value: "paid", label: "Pagos" } ];

const handleRetryLoad = () => { loadOrders(activeStatus, dateRange); };

const totalOrders = orders.length; const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

return ( <div className="container mx-auto px-4 py-8"> {/* ... restante da interface da página (igual antes) ... /} {/ Não incluí aqui por limitação de espaço */} </div> ); };

export default AdminOrders;

  
