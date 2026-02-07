import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, Database, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
export function ContentStudio() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Content Studio</h1>
            <p className="text-slate-400">Define your Astro content schemas and manage entries.</p>
          </div>
          <Button className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" /> Create Collection
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-2xl border-none flex flex-col items-center justify-center py-12 text-center group cursor-pointer border border-white/5 hover:border-primary/50 transition-colors">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">New Collection</h3>
            <p className="text-slate-500 text-sm">Create a new schema for your site.</p>
          </motion.div>
          {[1, 2].map((i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="glass-panel p-6 rounded-2xl border-none cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Database className="h-5 w-5 text-slate-400" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Blog Posts</h3>
              <p className="text-slate-500 text-sm mb-4">A standard collection for articles.</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FileText className="h-3 w-3" /> 24 Entries
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                Updated 2h ago
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}