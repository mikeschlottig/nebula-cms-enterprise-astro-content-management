import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cloudflareService, type GeoPerformancePoint } from '@/lib/cloudflare';
import { Globe, Loader2, Filter, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
type RegionFilter = 'all' | 'americas' | 'emea' | 'apac';
function filterLabel(v: RegionFilter): string {
  switch (v) {
    case 'all':
      return 'All regions';
    case 'americas':
      return 'Americas';
    case 'emea':
      return 'EMEA';
    case 'apac':
      return 'APAC';
    default:
      return 'All regions';
  }
}
function groupForCode(code: string): RegionFilter {
  // Minimal grouping for demo purposes
  const americas = new Set(['SJC', 'LAX', 'DFW', 'IAD', 'GRU']);
  const emea = new Set(['LHR', 'CDG', 'FRA', 'AMS', 'DXB']);
  const apac = new Set(['NRT', 'HKG', 'SIN', 'BOM', 'SYD']);
  if (americas.has(code)) return 'americas';
  if (emea.has(code)) return 'emea';
  if (apac.has(code)) return 'apac';
  return 'all';
}
function latencyColor(latencyMs: number): string {
  if (latencyMs <= 35) return '#34d399'; // green
  if (latencyMs <= 75) return '#4facfe'; // blue
  if (latencyMs <= 120) return '#F38020'; // orange
  return '#ef4444'; // red
}
export function SeoGeo() {
  const [region, setRegion] = useState<RegionFilter>('all');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['geo-performance'],
    queryFn: () => cloudflareService.getGeoPerformance(),
    staleTime: 30_000,
  });
  const points = useMemo(() => {
    const all = data ?? [];
    if (region === 'all') return all;
    return all.filter((p) => groupForCode(p.code) === region);
  }, [data, region]);
  const rankData = useMemo(() => {
    return points
      .slice()
      .sort((a, b) => b.searchRank - a.searchRank)
      .map((p) => ({ name: p.code, rank: p.searchRank }));
  }, [points]);
  const latencyData = useMemo(() => {
    return points
      .slice()
      .sort((a, b) => a.latencyP50 - b.latencyP50)
      .map((p) => ({
        name: p.code,
        p50: p.latencyP50,
        p95: p.latencyP95,
      }));
  }, [points]);
  const summary = useMemo(() => {
    if (!points.length) {
      return {
        avgP50: 0,
        avgAvail: 0,
        topRank: 0,
      };
    }
    const avgP50 = Math.round(points.reduce((acc, p) => acc + p.latencyP50, 0) / points.length);
    const avgAvail = points.reduce((acc, p) => acc + p.availability, 0) / points.length;
    const topRank = Math.max(...points.map((p) => p.searchRank));
    return {
      avgP50,
      avgAvail,
      topRank,
    };
  }, [points]);
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              SEO x GEO
            </h1>
            <p className="text-slate-400">
              Global visibility + edge performance monitoring. Optimize rankings and delivery latency by region.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <div className="min-w-[180px]">
                <Select value={region} onValueChange={(v) => setRegion(v as RegionFilter)}>
                  <SelectTrigger className="h-9 bg-transparent border-white/10 text-slate-200">
                    <SelectValue placeholder="Filter region" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="all">{filterLabel('all')}</SelectItem>
                    <SelectItem value="americas">{filterLabel('americas')}</SelectItem>
                    <SelectItem value="emea">{filterLabel('emea')}</SelectItem>
                    <SelectItem value="apac">{filterLabel('apac')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-24 text-slate-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p>Failed to load GEO performance metrics.</p>
            <p className="text-xs mt-2">Try refreshing.</p>
          </div>
        ) : points.length === 0 ? (
          <div className="text-center py-24 text-slate-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p>No metrics found for this region filter.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-panel border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Avg p50 Latency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white font-mono">{summary.avgP50}ms</div>
                  <p className="text-xs text-slate-500 mt-1">Aggregated across selected regions.</p>
                </CardContent>
              </Card>
              <Card className="glass-panel border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white font-mono">{(summary.avgAvail * 100).toFixed(2)}%</div>
                  <p className="text-xs text-slate-500 mt-1">Edge health snapshot (simulated).</p>
                </CardContent>
              </Card>
              <Card className="glass-panel border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Top Search Rank</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white font-mono">{summary.topRank}</div>
                  <p className="text-xs text-slate-500 mt-1">Higher is better (0–100).</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-panel border-white/5 lg:col-span-2 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white">Edge node performance map</CardTitle>
                </CardHeader>
                <CardContent>
                  <TooltipProvider delayDuration={120}>
                    <WorldMap points={points} />
                  </TooltipProvider>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-white/10 text-slate-400 bg-white/5">
                      Dot color reflects p50 latency
                    </Badge>
                    <Badge variant="outline" className="border-white/10 text-slate-400 bg-white/5">
                      Hover nodes for rank + availability
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-panel border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Rank by Region</CardTitle>
                </CardHeader>
                <CardContent className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rankData}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                      <RechartsTooltip
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="rank" fill="#BC52EE" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card className="glass-panel border-white/5">
              <CardHeader>
                <CardTitle className="text-white">GEO latency distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latencyData}>
                    <defs>
                      <linearGradient id="p50" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4facfe" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#4facfe" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="p95" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F38020" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#F38020" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <RechartsTooltip
                      cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="p50" stroke="#4facfe" fill="url(#p50)" strokeWidth={2} />
                    <Area type="monotone" dataKey="p95" stroke="#F38020" fill="url(#p95)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
function WorldMap({ points }: { points: GeoPerformancePoint[] }) {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
        <svg viewBox="0 0 1000 520" className="w-full h-auto">
          <defs>
            <linearGradient id="ocean" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgba(79,172,254,0.10)" />
              <stop offset="1" stopColor="rgba(188,82,238,0.10)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="1000" height="520" fill="url(#ocean)" />
          {/* Extremely simplified "world" silhouette for aesthetics */}
          <path
            d="M120,240 C220,140 340,120 420,190 C500,260 560,220 620,190 C690,150 760,160 820,210 C900,280 880,360 800,390 C720,420 650,410 590,380 C530,350 480,360 420,410 C360,460 240,450 170,380 C110,320 90,280 120,240 Z"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          <path
            d="M690,310 C740,280 800,290 840,320 C900,370 870,420 820,440 C780,455 740,440 710,410 C680,380 660,340 690,310 Z"
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
          {points.map((p) => (
            <Tooltip key={p.code}>
              <TooltipTrigger asChild>
                <circle
                  cx={p.mapX}
                  cy={p.mapY}
                  r={7}
                  fill={latencyColor(p.latencyP50)}
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth="2"
                  style={{ cursor: 'default' }}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 border-white/10 text-white">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{p.name}</span>
                    <Badge variant="outline" className="border-white/10 text-slate-300 bg-white/5">
                      {p.code}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400">
                    p50: <span className="text-white font-mono">{p.latencyP50}ms</span> • p95:{' '}
                    <span className="text-white font-mono">{p.latencyP95}ms</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Availability: <span className="text-white font-mono">{(p.availability * 100).toFixed(2)}%</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Search Rank: <span className="text-white font-mono">{p.searchRank}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </svg>
      </div>
    </div>
  );
}
function latencyColor(latencyMs: number): string {
  if (latencyMs <= 35) return '#34d399';
  if (latencyMs <= 75) return '#4facfe';
  if (latencyMs <= 120) return '#F38020';
  return '#ef4444';
}