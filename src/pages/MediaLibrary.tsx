import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Upload, Search, Image as ImageIcon, Copy, Trash2, CheckCircle2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
const MOCK_ASSETS = [
  { id: '1', name: 'Nebula-Cover.jpg', size: '1.2 MB', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=800&q=80' },
  { id: '2', name: 'Dashboard-V2.png', size: '2.4 MB', type: 'image/png', url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80' },
  { id: '3', name: 'Client-Logo.svg', size: '45 KB', type: 'image/svg+xml', url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=800&q=80' },
  { id: '4', name: 'Astro-Galaxy.webp', size: '890 KB', type: 'image/webp', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80' },
  { id: '5', name: 'Dark-Matter.jpg', size: '3.1 MB', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=800&q=80' },
  { id: '6', name: 'Event-Horizon.png', size: '1.7 MB', type: 'image/png', url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80' },
];
export function MediaLibrary() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleUpload = () => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast.success("Asset uploaded to R2 bucket");
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.info("URL copied to clipboard");
  };
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Media Library</h1>
            <p className="text-slate-400">High-performance asset management on Cloudflare R2.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-64"
              />
            </div>
            <Button className="btn-gradient" onClick={handleUpload} disabled={uploading}>
              <Upload className="mr-2 h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Asset'}
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {uploading && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-3 mb-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Syncing with R2 Edge...</span>
                  <span className="text-primary font-mono">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MOCK_ASSETS.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-panel border-none group overflow-hidden">
                <div className="aspect-square relative overflow-hidden bg-slate-800">
                  <img 
                    src={asset.url} 
                    alt={asset.name} 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full" onClick={() => copyUrl(asset.url)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-9 w-9 rounded-full">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 fill-black/20" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-white truncate">{asset.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">{asset.type.split('/')[1].toUpperCase()}</span>
                    <span className="text-xs text-slate-500">{asset.size}</span>
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