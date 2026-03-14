import React, { useState } from "react";
import { Link } from "react-router-dom";
import { subDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  ArrowLeft, Users, Eye, MousePointerClick, Clock, UserPlus, BarChart3,
  Globe, Timer, RefreshCw,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/DateRangePicker";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { toast } from "sonner";

import {
  fetchSnapshots, aggregateOverviews, buildDailyFromSnapshots,
  parseSourcesFromSnapshot, parseConversionTimeFromSnapshot,
  triggerSnapshot,
  type GA4SnapshotRow,
} from "@/services/ga4Service";

const dailyChartConfig: ChartConfig = {
  activeUsers: { label: "Usuários", color: "hsl(var(--primary))" },
  sessions: { label: "Sessões", color: "hsl(142, 76%, 36%)" },
  pageViews: { label: "Pageviews", color: "hsl(262, 83%, 58%)" },
};

const sourcesChartConfig: ChartConfig = {
  sessions: { label: "Sessões", color: "hsl(142, 76%, 36%)" },
};

const conversionChartConfig: ChartConfig = {
  avgSessionDuration: { label: "Duração Média (s)", color: "hsl(25, 95%, 53%)" },
  conversions: { label: "Conversões", color: "hsl(var(--primary))" },
};

const AdminGA4 = () => {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : format(subDays(new Date(), 30), "yyyy-MM-dd");
  const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

  // Fetch all snapshots in date range
  const { data: allSnapshots, isLoading } = useQuery({
    queryKey: ["ga4-snapshots", startDate, endDate],
    queryFn: () => fetchSnapshots(startDate, endDate),
  });

  const overviewSnapshots = (allSnapshots || []).filter((s: GA4SnapshotRow) => s.report_type === 'overview');
  const sourcesSnapshots = (allSnapshots || []).filter((s: GA4SnapshotRow) => s.report_type === 'sources');
  const conversionSnapshots = (allSnapshots || []).filter((s: GA4SnapshotRow) => s.report_type === 'conversion_time');

  const overview = aggregateOverviews(overviewSnapshots);
  const dailyData = buildDailyFromSnapshots(overviewSnapshots);

  // Merge sources across days
  const sourcesMap = new Map<string, { sessions: number; activeUsers: number }>();
  sourcesSnapshots.forEach((s: GA4SnapshotRow) => {
    parseSourcesFromSnapshot(s.data).forEach(row => {
      const existing = sourcesMap.get(row.name) || { sessions: 0, activeUsers: 0 };
      sourcesMap.set(row.name, {
        sessions: existing.sessions + row.sessions,
        activeUsers: existing.activeUsers + row.activeUsers,
      });
    });
  });
  const sourcesData = Array.from(sourcesMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);

  // Merge conversion time data
  const conversionMap = new Map<string, { avgDuration: number; sessions: number; conversions: number; count: number }>();
  conversionSnapshots.forEach((s: GA4SnapshotRow) => {
    parseConversionTimeFromSnapshot(s.data).forEach(row => {
      const existing = conversionMap.get(row.source) || { avgDuration: 0, sessions: 0, conversions: 0, count: 0 };
      conversionMap.set(row.source, {
        avgDuration: existing.avgDuration + row.avgSessionDuration,
        sessions: existing.sessions + row.sessions,
        conversions: existing.conversions + row.conversions,
        count: existing.count + 1,
      });
    });
  });
  const conversionData = Array.from(conversionMap.entries())
    .map(([source, v]) => ({
      source,
      avgSessionDuration: Math.round(v.avgDuration / v.count),
      sessions: v.sessions,
      conversions: v.conversions,
    }))
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 10);

  // Manual snapshot trigger
  const snapshotMutation = useMutation({
    mutationFn: triggerSnapshot,
    onSuccess: () => {
      toast.success("Snapshot coletado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["ga4-snapshots"] });
    },
    onError: (err: Error) => {
      toast.error(`Erro: ${err.message}`);
    },
  });

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  const hasData = (allSnapshots || []).length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link to="/admin-dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Google Analytics (GA4)</h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => snapshotMutation.mutate()}
            disabled={snapshotMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${snapshotMutation.isPending ? 'animate-spin' : ''}`} />
            Coletar Snapshot
          </Button>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
          <BarChart3 className="h-12 w-12" />
          <p className="text-lg">Nenhum snapshot encontrado neste período.</p>
          <p className="text-sm">Clique em "Coletar Snapshot" ou aguarde o cron diário.</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{overview.activeUsers.toLocaleString("pt-BR")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Sessões</CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{overview.sessions.toLocaleString("pt-BR")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Pageviews</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{overview.pageViews.toLocaleString("pt-BR")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Taxa Rejeição</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{`${(overview.bounceRate * 100).toFixed(1)}%`}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Duração Média</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{formatDuration(overview.avgSessionDuration)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Novos Usuários</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{overview.newUsers.toLocaleString("pt-BR")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Métricas Diárias</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={dailyChartConfig} className="h-[300px] w-full">
                <LineChart data={dailyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="activeUsers" stroke="var(--color-activeUsers)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sessions" stroke="var(--color-sessions)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pageViews" stroke="var(--color-pageViews)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Fontes de Tráfego
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={sourcesChartConfig} className="h-[350px] w-full">
                  <BarChart data={sourcesData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={90} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Conversion Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Timer className="h-4 w-4" /> Tempo até Conversão (por Fonte)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversionData.length === 0 ? (
                  <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
                    Sem dados de conversão no período
                  </div>
                ) : (
                  <ChartContainer config={conversionChartConfig} className="h-[350px] w-full">
                    <BarChart data={conversionData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="source" fontSize={11} tickLine={false} axisLine={false} width={90} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgSessionDuration" fill="var(--color-avgSessionDuration)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminGA4;
