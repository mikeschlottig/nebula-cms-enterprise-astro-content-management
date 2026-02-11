import React, { useMemo, useRef, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, Search, Copy, Trash2, CheckCircle2, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
const MOCK_ASSETS = [
  {
    id: '1',
    name: 'Nebula-Cover.jpg',
    size: '1.2 MB',
    type: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Dashboard-V2.png',
    size: '2.4 MB',
    type: 'image/png',
    url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Client-Logo.svg',
    size: '45 KB',
    type: 'image/svg+xml',
    url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Astro-Galaxy.webp',
    size: '890 KB',
    type: 'image/webp',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    name: 'Dark-Matter.jpg',
    size: '3.1 MB',
    type: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '6',
    name: 'Event-Horizon.png',
    size: '1.7 MB',
    type: 'image/png',
    url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
  },
];
async function legacyCopyText(text: string, el?: HTMLInputElement | null): Promise<boolean> {
  // Best-effort fallback for restrictive clipboard policies.
  try {
    if (el) {
      el.focus();
      el.select();
      el.setSelectionRange(0, text.length);
    }
    // execCommand is deprecated but still works in many environments.
    const ok = document.execCommand?.('copy') ?? false;
    return !!ok;
  } catch (e) {
    console.warn('[MediaLibrary] legacy copy failed:', e);
    return false;
  }
}
export function MediaLibrary() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copyFallbackOpen, setCopyFallbackOpen] = useState(false);
  const [copyFallbackUrl, setCopyFallbackUrl] = useState('');
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const handleUpload = () => {
    setUploading(true);
    setProgress(0);
    const interval = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(interval);
          setUploading(false);
          toast.success('Asset uploaded to R2 bucket');
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };
  const openFallback = (url: string) => {
    setCopyFallbackUrl(url);
    setCopyFallbackOpen(true);
    // Select the text once the dialog opens.
    window.setTimeout(() => {
      try {
        const el = fallbackInputRef.current;
        if (!el) return;
        el.focus();
        el.select();
        el.setSelectionRange(0, url.length);
      } catch (e) {
        console.warn('[MediaLibrary] failed to focus/select fallback input:', e);
      }
    }, 0);
  };
  const copyUrl = async (url: string) => {
    // Primary attempt: Clipboard API
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard');
        return;
      }
      throw new Error('Clipboard API not available');
    } catch (error) {
      // Permission policy / NotAllowedError happens in some embedded/preview contexts.
      console.warn('[MediaLibrary] Clipboard write blocked; opening fallback UI.', error);
      toast.message('Copy blocked by browser policy', {
        description: 'Use the fallback dialog to copy manually.',
      });
      openFallback(url);
    }
  };
  const assetTypeLabel = useMemo(() => {
    const getLabel = (mime: string) => {
      const last = mime.split('/')[1] || mime;
      return last.toUpperCase();
    };
    return getLabel;
  }, []);
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Media Library</h1>
            <p className="text-slate-400">High-performance asset management on Cloudflare R2.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search assets..."
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-72"
                aria-label="Search assets"
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
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-panel border-none group overflow-hidden">
                <div className="aspect-square relative overflow-hidden bg-slate-800">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full"
                      onClick={() => void copyUrl(asset.url)}
                      aria-label={`Copy URL for ${asset.name}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-9 w-9 rounded-full"
                      onClick={() => toast.message('Delete is a demo action', { description: 'Wire this to R2 when ready.' })}
                      aria-label={`Delete ${asset.name}`}
                    >
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
                    <span className="text-xs text-slate-500">{assetTypeLabel(asset.type)}</span>
                    <span className="text-xs text-slate-500">{asset.size}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <Dialog open={copyFallbackOpen} onOpenChange={setCopyFallbackOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                Copy URL
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Your browser blocked automatic clipboard access. Copy manually below, or try the fallback button.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                ref={fallbackInputRef}
                readOnly
                value={copyFallbackUrl}
                className="bg-white/5 border-white/10 font-mono text-xs text-white"
                onFocus={(e) => e.currentTarget.select()}
                aria-label="Asset URL (read only)"
              />
              <p className="text-xs text-slate-500">
                Tip: Click the input to select, then press <span className="font-mono">Ctrl/Cmd + C</span>.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                className="border-white/10"
                onClick={() => setCopyFallbackOpen(false)}
              >
                Close
              </Button>
              <Button
                className="btn-gradient"
                onClick={async () => {
                  try {
                    const el = fallbackInputRef.current;
                    if (el) {
                      el.focus();
                      el.select();
                      el.setSelectionRange(0, copyFallbackUrl.length);
                    }
                    // Try clipboard again (sometimes user gesture + dialog context helps).
                    if (navigator.clipboard?.writeText) {
                      await navigator.clipboard.writeText(copyFallbackUrl);
                      toast.success('URL copied to clipboard');
                      setCopyFallbackOpen(false);
                      return;
                    }
                    const ok = await legacyCopyText(copyFallbackUrl, el);
                    if (ok) {
                      toast.success('URL copied to clipboard');
                      setCopyFallbackOpen(false);
                    } else {
                      toast.message('Copy not permitted', { description: 'Please copy manually from the input.' });
                    }
                  } catch (e) {
                    console.warn('[MediaLibrary] fallback copy failed:', e);
                    toast.message('Copy not permitted', { description: 'Please copy manually from the input.' });
                  }
                }}
              >
                Copy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}