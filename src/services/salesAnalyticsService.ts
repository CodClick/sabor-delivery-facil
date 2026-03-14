import { supabase } from "@/integrations/supabase/client";

// ---- Sales heatmap by day/hour ----
export interface SalesHeatmapRow {
  dayOfWeek: number;
  hour: number;
  orders: number;
  revenue: number;
}

export const fetchSalesHeatmap = async (startDate: string, endDate: string): Promise<SalesHeatmapRow[]> => {
  const { data, error } = await supabase
    .from('pedidos_sabor_delivery' as any)
    .select('data_criacao, valor_total, status_atual')
    .gte('data_criacao', `${startDate}T00:00:00`)
    .lte('data_criacao', `${endDate}T23:59:59`)
    .not('status_atual', 'eq', 'cancelled');

  if (error) throw new Error(error.message);

  const grid: { orders: number; revenue: number }[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({ orders: 0, revenue: 0 }))
  );

  ((data as any[]) || []).forEach((row: any) => {
    const d = new Date(row.data_criacao);
    if (isNaN(d.getTime())) return;
    const day = d.getDay(); // 0=Sun
    const hour = d.getHours();
    grid[day][hour].orders += 1;
    grid[day][hour].revenue += Number(row.valor_total || 0);
  });

  const result: SalesHeatmapRow[] = [];
  for (let day = 0; day < 7; day++) {
    for (let h = 0; h < 24; h++) {
      if (grid[day][h].orders > 0) {
        result.push({ dayOfWeek: day, hour: h, ...grid[day][h] });
      }
    }
  }
  return result;
};

// ---- Sales by UTM source ----
export interface SalesBySourceRow {
  source: string;
  orders: number;
  revenue: number;
}

export const fetchSalesBySource = async (startDate: string, endDate: string): Promise<SalesBySourceRow[]> => {
  const { data, error } = await supabase
    .from('pedidos_sabor_delivery' as any)
    .select('utm_source, valor_total, status_atual')
    .gte('data_criacao', `${startDate}T00:00:00`)
    .lte('data_criacao', `${endDate}T23:59:59`)
    .not('status_atual', 'eq', 'cancelled');

  if (error) throw new Error(error.message);

  const map = new Map<string, { orders: number; revenue: number }>();
  ((data as any[]) || []).forEach((row: any) => {
    const src = row.utm_source || '(direto)';
    const existing = map.get(src) || { orders: 0, revenue: 0 };
    map.set(src, {
      orders: existing.orders + 1,
      revenue: existing.revenue + Number(row.valor_total || 0),
    });
  });

  return Array.from(map.entries())
    .map(([source, v]) => ({ source, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
};

// ---- Sales by UTM campaign ----
export interface SalesByCampaignRow {
  campaign: string;
  orders: number;
  revenue: number;
}

export const fetchSalesByCampaign = async (startDate: string, endDate: string): Promise<SalesByCampaignRow[]> => {
  const { data, error } = await supabase
    .from('pedidos_sabor_delivery' as any)
    .select('utm_campaign, valor_total, status_atual')
    .gte('data_criacao', `${startDate}T00:00:00`)
    .lte('data_criacao', `${endDate}T23:59:59`)
    .not('status_atual', 'eq', 'cancelled')
    .not('utm_campaign', 'is', null);

  if (error) throw new Error(error.message);

  const map = new Map<string, { orders: number; revenue: number }>();
  ((data as any[]) || []).forEach((row: any) => {
    const campaign = row.utm_campaign || '';
    if (!campaign) return;
    const existing = map.get(campaign) || { orders: 0, revenue: 0 };
    map.set(campaign, {
      orders: existing.orders + 1,
      revenue: existing.revenue + Number(row.valor_total || 0),
    });
  });

  return Array.from(map.entries())
    .map(([campaign, v]) => ({ campaign, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
};
