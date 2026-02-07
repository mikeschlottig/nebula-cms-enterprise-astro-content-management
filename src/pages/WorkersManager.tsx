import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cloudflareService } from '@/lib/cloudflare';
import { Terminal, Activity, Cpu, Database, Play } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
const mockMetricData = [
  { time: '00:00', req: 120 }, { time: '04:00', req: 450 }, { time: '08:00', req: 1200 },
  { time: '12:00', req: 900 }, { time: '16:00', req: 1500 }, { time: '20:00', req: 800 },
];
export function WorkersManager() {
  const { data: workers } = useQuery({
    queryKey: ['workers'],
    queryFn: () => cloudflareService.getWorkers()
  });
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Workers Manager</h1>
          <p className="text-slate-400">Manage edge scripts and monitor real-time execution.</p>
        </div>
        <Tabs defaultValue="scripts" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="scripts" className="data-[state=active]:bg-primary">Scripts</TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-primary">Real-time Logs</TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-primary">Metrics</TabsTrigger>
          </TabsList>
          <TabsContent value="scripts" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workers?.map(worker => (
              <Card key={worker.id} className="glass-panel border-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" /> {worker.name}
                  </CardTitle>
                  <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-500 uppercase">CPU Avg</p>
                      <p className="text-white font-mono">{worker.usage.cpu}</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-500 uppercase">Memory</p>
                      <p className="text-white font-mono">{worker.usage.memory}</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-500 uppercase">Requests</p>
                      <p className="text-white font-mono">{worker.usage.requests.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Routes</p>
                    {worker.routes.map(r => <code key={r} className="block text-[10px] bg-slate-800 text-slate-300 p-1 rounded">{r}</code>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="logs">
            <Card className="glass-panel border-none">
              <CardContent className="p-0">
                <div className="bg-black/40 h-[400px] rounded-xl font-mono text-sm p-4 overflow-y-auto space-y-1">
                  <div className="text-primary flex items-center gap-2 mb-2">
                    <Play className="h-3 w-3 fill-current" /> Streaming live logs from Cloudflare Edge...
                  </div>
                  {workers?.[0].logs.map((log, i) => (
                    <div key={i} className="text-slate-300">
                      <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                      {log}
                    </div>
                  ))}
                  <div className="text-blue-400">... [LOGSTREAM] Waiting for new events</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="metrics">
            <Card className="glass-panel border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Network Throughput (Total Requests)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockMetricData}>
                    <XAxis dataKey="time" stroke="#475569" fontSize={12} />
                    <YAxis stroke="#475569" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                    <Area type="monotone" dataKey="req" stroke="#F38020" fill="#F38020" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}