import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateOrder } from "@/services/orderService";

const Entregador = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("[Entregador] Componente carregado");

  useEffect(() => {
    console.log("[Entregador] Iniciando consulta de pedidos...");
    
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    console.log("[Entregador] Range de datas:", { start, end });

    const startTimestamp = Timestamp.fromDate(start);
    const endTimestamp = Timestamp.fromDate(end);

    const ordersRef = collection(db, "orders");
    const ordersQuery = query(
      ordersRef,
      where("status", "==", "delivering"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp),
      orderBy("createdAt", "desc")
    );

    console.log("[Entregador] Query criada, configurando listener...");

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        console.log("[Entregador] Snapshot recebido, docs encontrados:", snapshot.size);
        const fetchedOrders: Order[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        console.log("[Entregador] Pedidos processados:", fetchedOrders);
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (error) => {
        console.error("[Entregador] Erro na consulta:", error);
        setLoading(false);
      }
    );

    return () => {
      console.log("[Entregador] Cleanup - desconectando listener");
      unsubscribe();
    };
  }, []);

  // Query de debug para ver todos os pedidos do dia
  useEffect(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const startTimestamp = Timestamp.fromDate(start);
    const endTimestamp = Timestamp.fromDate(end);

    const ordersRef = collection(db, "orders");
    const allOrdersQuery = query(
      ordersRef,
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(allOrdersQuery, (snapshot) => {
      const allOrdersData: Order[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      console.log("[Debug] Todos os pedidos do dia:", allOrdersData);
      setAllOrders(allOrdersData);
    });

    return () => unsubscribe();
  }, []);

  const handleConfirmEntrega = async (order: Order) => {
    // Corrigido: verificar se o pagamento é "cash" em vez de "dinheiro"
    const novoStatus = order.paymentMethod === "cash" ? "received" : "delivered";

    try {
      await updateOrder(order.id, { status: novoStatus });
      toast({
        title: "Status atualizado",
        description: `Pedido #${order.id.substring(0, 6)} marcado como ${translateStatus(novoStatus)}`,
      });
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido.",
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

  const formatFullDate = (input: string | Date | Timestamp) => {
    let date: Date;

    if (input instanceof Timestamp) {
      date = input.toDate();
    } else if (typeof input === 'string') {
      date = new Date(input);
    } else {
      date = input;
    }

    if (isNaN(date.getTime())) return "Data inválida";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pedidos em rota de entrega</h1>

      {/* Debug info */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded">
        <h3 className="font-bold text-sm mb-2">Debug Info:</h3>
        <p className="text-sm">Pedidos "delivering": {orders.length}</p>
        <p className="text-sm">Total de pedidos hoje: {allOrders.length}</p>
        <p className="text-sm">Status disponíveis: {Array.from(new Set(allOrders.map(o => o.status))).join(", ")}</p>
        <div className="text-xs mt-2">
          <p>Pedidos por status:</p>
          {Object.entries(
            allOrders.reduce((acc, order) => {
              acc[order.status] = (acc[order.status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([status, count]) => (
            <span key={status} className="inline-block mr-4">
              {status}: {count}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Nenhum pedido em rota de entrega.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 py-4">
                <div>
                  <p className="text-sm text-gray-500">Pedido #{order.id.substring(0, 6)} - {formatFullDate(order.createdAt)}</p>
                  <p className="text-sm font-medium text-gray-700">
                    Cliente: {order.customerName}
                  </p>
                  <p className="text-sm text-gray-500">Fone: {order.customerPhone}</p>
                </div>
              </CardHeader>
              <CardContent className="py-4 space-y-2">
                <p className="text-sm font-medium">Itens: {order.items.length}</p>
                <p className="font-medium">Total: R$ {order.total.toFixed(2)}</p>
                <Button onClick={() => handleConfirmEntrega(order)} className="w-full mt-2">
                  Confirmar entrega
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Entregador;
