import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { intelligenceService } from '@/lib/intelligence';
import { BrainCircuit, Database, RefreshCw, Trash2, Zap, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
const COLORS = ['#F38020', '#BC52EE', '#4facfe', '#34d399'];
export function VectorRAG() {
  const { data: indexes, refetch } = useQuery({
    queryKey: ['vector-indexes'],
    queryFn: () => intelligenceService.getVectorIndexes()
  });
  const chartData = [
    { name: 'Astro Docs', value: 45 },
    { name: 'CMS Content', value: 25 },
    { name: 'User Logs', value: 20 },
    { name: 'System Metadata', value: 10 },
  ];
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Vector RAG</h1>
            <p className="text-slate-400">Manage semantic search indexes and embeddings on Cloudflare Vectorize.</p>
          </div>
          <Button variant="outline" className="border-white/10" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Status
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {indexes?.map((idx) => (
              <motion.div key={idx.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-panel border-none group overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">{idx.name}</CardTitle>
                        <p className="text-xs text-slate-500 font-mono">{idx.id}</p>
                      </div>
                    </div>
                    <Badge variant={idx.status === 'ready' ? 'default' : 'secondary'} className={idx.status === 'ready' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}>
                      {idx.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Dimensions</p>
                        <p className="text-sm font-bold text-white font-mono">{idx.dimensions}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Metric</p>
                        <p className="text-sm font-bold text-white capitalize">{idx.metric}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Vectors</p>
                        <p className="text-sm font-bold text-white font-mono">{idx.vectors.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Namespaces</p>
                        <p className="text-sm font-bold text-white font-mono">{idx.namespaces}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <BarChart3 className="h-4 w-4 mr-2" /> View Clusters
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => intelligenceService.flushIndex(idx.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Flush Index
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="space-y-6">
            <Card className="glass-panel border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-purple-500" /> Dimension Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="glass-panel border-none bg-gradient-to-br from-primary/10 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-white">Embeddings Visualizer</h3>
                </div>
                <div className="aspect-square rounded-xl bg-black/40 relative overflow-hidden border border-white/5">
                  {[...Array(24)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, x: Math.random() * 200, y: Math.random() * 200 }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="absolute h-2 w-2 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-[10px] text-slate-500 font-mono bg-black/60 px-2 py-1 rounded">t-SNE Projection</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}