import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Users, Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

const AdminIntelligence = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntelligenceData = async () => {
      try {
        setIsLoading(true);
        // Simulando a busca de dados ou chamando sua função do Supabase
        const { data: result, error: supabaseError } = await supabase
          .from('admin_metrics') // Substitua pelo nome correto da sua tabela/view
          .select('*')
          .maybeSingle();

        if (supabaseError) throw supabaseError;
        
        // Se não houver dados, usamos um fallback para não quebrar a interface
        setData(result || {
          performance: [],
          insights: "Dados de inteligência sendo processados...",
          stats: { totalSales: 0, growth: 0, activeUsers: 0 }
        });
      } catch (err: any) {
        console.error("Erro ao carregar inteligência:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntelligenceData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Analisando dados com IA...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Erro ao carregar inteligência: {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          Inteligência de Negócio
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previsão de Vendas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {data?.stats?.totalSales?.toLocaleString() || "0,00"}</div>
            <p className="text-xs text-green-500">+{data?.stats?.growth || 0}% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retenção de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Clientes ativos na plataforma</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insight da IA</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-sm italic text-muted-foreground">
              "{data?.insights || "Nenhum insight disponível no momento."}"
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Tendências e Projeções</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.performance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIntelligence;
