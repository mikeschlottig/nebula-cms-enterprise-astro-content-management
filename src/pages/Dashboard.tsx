import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Database, Users, Zap, ArrowUpRight, Globe } from 'lucide-react';
const data = [
  { name: 'Mon', req: 400 }, { name: 'Tue', req: 300 }, { name: 'Wed', req: 600 },
  { name: 'Thu', req: 800 }, { name: 'Fri', req: 500 }, { name: 'Sat', req: 900 },
  { name: 'Sun', req: 700 },
];
const stats = [
  { label: 'Total Entries', value: '1,284', icon: Database, color: 'text-orange-500', trend: '+12%' },
  { label: 'API Requests', value: '45.2k', icon: Zap, color: 'text-purple-500', trend: '+5.4%' },
  { label: 'Active Users', value: '312', icon: Users, color: 'text-blue-500', trend: '+2%' },
  { label: 'Edge Latency', value: '12ms', icon: Globe, color: 'text-green-500', trend: '-2ms' },
];
export function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Nebula Command</h1>
            <p className="text-slate-400">Enterprise content delivery metrics across the Cloudflare edge.</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            Publish All <ArrowUpRight className="h-4 w-4" />
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-panel border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-slate-400">{stat.label}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="text-green-500 font-medium">{stat.trend}</span> from last week
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
                <Activity className="h-5 w-5 text-primary" /> Traffic Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F38020" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F38020" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                  <Area type="monotone" dataKey="req" stroke="#F38020" fillOpacity={1} fill="url(#colorReq)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="glass-panel border-none">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Create New Collection', 'Optimize R2 Bucket', 'View Edge Analytics', 'CMS Settings'].map((action, i) => (
                <motion.button key={action} whileHover={{ x: 5 }} className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-sm text-slate-300 transition-colors">
                  {action}
                </motion.button>
              ))}
              <div className="pt-4 mt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  All Edge Nodes Operational
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}