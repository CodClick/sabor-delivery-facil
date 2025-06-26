// Página Entregador com botão "Marcar como Recebido"
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateOrder } from "@/services/orderService";

const EntregadorPedidos = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
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
        const newOrders: Order[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Order;
          newOrders.push({ ...data, id: doc.id });
        });
        setOrders(newOrders);
      },
      (err) => {
        console.error("Erro no listener:", err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os pedidos.",
          variant: "destructive",
        });
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const updatedOrder = await updateOrder(orderId, { status: newStatus });
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));

      toast({
        title: "Pedido atualizado",
        description: `Status alterado para ${translateStatus(newStatus)}`,
      });
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o pedido.",
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
    };
    return statusMap[status] || status;
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Pedidos do Entregador</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
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
    </div>
  );
};

export default Entregador;
