import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Cpu, Key, Globe, Sparkles } from 'lucide-react';
export function Settings() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
          <p className="text-slate-400">Configure your Nebula instance and AI parameters.</p>
        </div>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 text-slate-400">
            <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-white">General</TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-white">AI Engine</TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-primary data-[state=active]:text-white">API Keys</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-panel border-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" /> System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-400">Edge Deployment</span>
                    <Badge variant="outline" className="border-green-500 text-green-500">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-400">Durable Objects</span>
                    <span className="text-white font-mono">2 Active</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">CMS Version</span>
                    <span className="text-white font-mono">v1.2.4-stable</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-panel border-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" /> Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-400">Admin Session Timeout</Label>
                    <Input defaultValue="24h" className="bg-white/5 border-white/10" />
                  </div>
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">Force Logout All</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="ai" className="mt-6">
            <Card className="glass-panel border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" /> Nebula AI Config
                </CardTitle>
                <CardDescription className="text-slate-500">Fine-tune how the AI interacts with your CMS.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">System Persona</Label>
                  <textarea 
                    className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-slate-300 focus:ring-1 focus:ring-primary outline-none"
                    defaultValue="You are Nebula AI, an enterprise CMS assistant built for Astro and Cloudflare..."
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="btn-gradient">Update Configuration</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="api" className="mt-6">
            <Card className="glass-panel border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" /> Public API Access
                </CardTitle>
                <CardDescription className="text-slate-500">Use these keys to fetch content for your Astro site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Public Read Key</Label>
                  <div className="flex gap-2">
                    <Input readOnly value="nebula_pk_live_51M..." className="bg-white/5 border-white/10 font-mono" />
                    <Button variant="outline" className="border-white/10">Copy</Button>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm">
                  Keep your API keys secure. Do not commit secret keys to public repositories.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}