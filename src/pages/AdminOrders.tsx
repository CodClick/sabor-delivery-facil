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
      const updatedOrders: Order[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() ?? doc.data().createdAt,
      })) as Order[];

      setOrders(updatedOrders);
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

return ( <div className="container mx-auto px-4 py-8"> {orders.length === 0 ? ( <p className="text-gray-500">Nenhum pedido encontrado.</p> ) : ( <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {orders.map((order) => ( <Card key={order.id} className="overflow-hidden"> <CardHeader className="bg-gray-50 py-4"> <div> <p className="text-sm text-gray-500">Pedido #{order.id.substring(0, 6)}</p> <p className="text-sm font-medium text-gray-700"> Cliente: {order.customerName} </p> </div> </CardHeader> <CardContent className="py-4 space-y-2"> <p className="text-sm font-medium">Itens: {order.items.length}</p> <p className="font-medium">Total: R$ {order.total.toFixed(2)}</p> </CardContent> </Card> ))} </div> )} </div> ); };

export default AdminOrders;

