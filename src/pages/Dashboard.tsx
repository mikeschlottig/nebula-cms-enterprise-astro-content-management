import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Database, Users, Zap, ArrowUpRight, Globe, FileText, Clock } from 'lucide-react';
import { cmsService } from '@/lib/cms';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
const data = [
  { name: 'Mon', req: 400 }, { name: 'Tue', req: 300 }, { name: 'Wed', req: 600 },
  { name: 'Thu', req: 800 }, { name: 'Fri', req: 500 }, { name: 'Sat', req: 900 },
  { name: 'Sun', req: 700 },
];
export function Dashboard() {
  const { data: collectionsRes } = useQuery({
    queryKey: ['collections'],
    queryFn: () => cmsService.getCollections()
  });
  const collections = collectionsRes?.data || [];
  // Flatten all entries for the "Recent Activity" list
  const { data: allEntriesRes } = useQuery({
    queryKey: ['dashboard-entries'],
    queryFn: async () => {
      const results = await Promise.all(
        collections.map(col => cmsService.getEntries(col.id))
      );
      return results.flatMap(r => r.data || []);
    },
    enabled: collections.length > 0
  });
  const allEntries = (allEntriesRes || []).sort((a, b) => b.updatedAt - a.updatedAt);
  const recentEntries = allEntries.slice(0, 5);
  const stats = [
    { label: 'Collections', value: collections.length, icon: Database, color: 'text-orange-500', trend: '+12%' },
    { label: 'Total Entries', value: allEntries.length, icon: FileText, color: 'text-purple-500', trend: '+5.4%' },
    { label: 'Published', value: allEntries.filter(e => e.status === 'published').length, icon: Zap, color: 'text-blue-500', trend: 'Live' },
    { label: 'Edge Latency', value: '14ms', icon: Globe, color: 'text-green-500', trend: '-2ms' },
  ];
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Nebula Command</h1>
            <p className="text-slate-400">Enterprise content delivery metrics across the Cloudflare edge.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            Purge Cache <ArrowUpRight className="h-4 w-4" />
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-panel border-none shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-slate-400">{stat.label}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white font-mono">{stat.value}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="text-green-500 font-medium">{stat.trend}</span> status
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-panel border-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Traffic Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F38020" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F38020" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    itemStyle={{ color: '#F38020' }}
                  />
                  <Area type="monotone" dataKey="req" stroke="#F38020" fillOpacity={1} fill="url(#colorReq)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="glass-panel border-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {recentEntries.length === 0 ? (
                <p className="text-center py-12 text-slate-500 text-sm">No recent activity found.</p>
              ) : (
                recentEntries.map((entry, i) => {
                  const col = collections.find(c => c.id === entry.collectionId);
                  return (
                    <div key={entry.id} className="flex items-start gap-4 group">
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {String(entry.data[col?.fields[0]?.name || 'title'] || 'Untitled Entry')}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{col?.name || 'Unknown'}</p>
                      </div>
                      <Badge variant="outline" className={entry.status === 'published' ? 'border-green-500/50 text-green-500' : 'border-slate-700 text-slate-500'}>
                        {entry.status}
                      </Badge>
                    </div>
                  );
                })
              )}
              <div className="pt-4 border-t border-white/5">
                <Link to="/content" className="text-xs text-primary font-medium hover:underline flex items-center justify-center gap-1">
                  View all content <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}