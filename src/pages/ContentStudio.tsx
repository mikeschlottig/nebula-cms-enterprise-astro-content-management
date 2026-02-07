import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, Database, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cmsService } from '@/lib/cms';
import { SchemaBuilder } from '@/components/cms/SchemaBuilder';
export function ContentStudio() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const { data: collectionsRes, isLoading, refetch } = useQuery({
    queryKey: ['collections'],
    queryFn: () => cmsService.getCollections()
  });
  const collections = collectionsRes?.data || [];
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Content Studio</h1>
            <p className="text-slate-400">Define your Astro content schemas and manage entries.</p>
          </div>
          <Button className="btn-gradient" onClick={() => setIsBuilderOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Collection
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -5 }} 
              onClick={() => setIsBuilderOpen(true)}
              className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col items-center justify-center py-12 text-center group cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">New Collection</h3>
              <p className="text-slate-500 text-sm">Create a new schema for your site.</p>
            </motion.div>
            {collections.map((col, i) => (
              <motion.div key={col.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={`/content/${col.id}`}>
                  <Card className="glass-panel p-6 rounded-2xl border-white/5 cursor-pointer hover:border-primary/30 transition-colors h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <Database className="h-5 w-5 text-slate-400" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{col.name}</h3>
                    <p className="text-slate-500 text-sm mb-4">Slug: {col.slug}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <FileText className="h-3 w-3" /> {col.fields.length} Fields
                      <span className="h-1 w-1 rounded-full bg-slate-700" />
                      Created {new Date(col.createdAt).toLocaleDateString()}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <SchemaBuilder 
        open={isBuilderOpen} 
        onOpenChange={setIsBuilderOpen} 
        onSuccess={() => refetch()} 
      />
    </AppLayout>
  );
}
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}