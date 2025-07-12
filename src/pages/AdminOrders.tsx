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
            id: orderId,
            createdAt: data.createdAt?.toDate().toISOString?.() ?? data.createdAt,
          };

          setOrders((prev) => {
            const index = prev.findIndex((order) => order.id === orderId);
            if (index !== -1) {
              const newOrders = [...prev];
              newOrders[index] = { ...newOrders[index], ...normalizedData };
              return newOrders;
            }
            return prev;
          });

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

return ( <div className="container mx-auto px-4 py-8"> <p className="text-gray-700">Página carregada com sucesso. Conteúdo será exibido aqui.</p> </div> ); };

export default AdminOrders;
