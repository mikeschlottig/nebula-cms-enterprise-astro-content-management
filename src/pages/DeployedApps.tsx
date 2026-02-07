import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cloudflareService } from '@/lib/cloudflare';
import { Rocket, ExternalLink, GitBranch, RefreshCw, Globe, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
export function DeployedApps() {
  const { data: apps, isLoading } = useQuery({
    queryKey: ['deployed-apps'],
    queryFn: () => cloudflareService.getDeployedApps()
  });
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Deployed Apps</h1>
            <p className="text-slate-400">Cloudflare Pages and Workers connected to your Nebula CMS.</p>
          </div>
          <Button className="btn-gradient">
            <Rocket className="mr-2 h-4 w-4" /> Deploy New Project
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps?.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-panel border-none group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <CardTitle className="text-lg font-bold text-white">{app.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="capitalize border-white/10 text-slate-400">
                    {app.type}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Globe className="h-3 w-3" />
                      <a href={app.url} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors truncate">
                        {app.url}
                      </a>
                    </div>
                    {app.branch && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <GitBranch className="h-3 w-3" /> {app.branch}
                      </div>
                    )}
                  </div>
                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-slate-500">Ready at Edge</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" asChild>
                        <a href={app.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}