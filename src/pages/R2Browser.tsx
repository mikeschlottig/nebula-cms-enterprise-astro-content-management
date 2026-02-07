import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cloudflareService } from '@/lib/cloudflare';
import { Database, Folder, File, Search, Upload, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
export function R2Browser() {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const { data: buckets } = useQuery({
    queryKey: ['r2-buckets'],
    queryFn: () => cloudflareService.getR2Buckets()
  });
  return (
    <AppLayout container={false} className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="w-64 border-r border-white/5 bg-black/20 p-4 space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest px-2">Buckets</h2>
        <div className="space-y-1">
          {buckets?.map(bucket => (
            <button
              key={bucket.name}
              onClick={() => setSelectedBucket(bucket.name)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                selectedBucket === bucket.name ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">{bucket.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <header className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">{selectedBucket || 'Select a Bucket'}</h2>
            {selectedBucket && (
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                <ShieldCheck className="h-3 w-3 mr-1" /> Public Access Enabled
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm" placeholder="Search objects..." />
            </div>
            <Button size="sm" className="btn-gradient"><Upload className="h-4 w-4 mr-2" /> Upload</Button>
          </div>
        </header>
        <ScrollArea className="flex-1 p-6">
          {!selectedBucket ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
              <Database className="h-12 w-12 mb-4 opacity-10" />
              <p>Select an R2 bucket from the sidebar to browse objects.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="glass-panel border-none group cursor-pointer hover:bg-white/5">
                  <div className="aspect-square flex items-center justify-center bg-slate-800/50 rounded-t-xl">
                    {i % 3 === 0 ? <Folder className="h-12 w-12 text-primary/40" /> : <File className="h-12 w-12 text-slate-600" />}
                  </div>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-white truncate">{i % 3 === 0 ? `assets-v${i}` : `object_${i}.bin`}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{i * 12} KB • 2h ago</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </AppLayout>
  );
}