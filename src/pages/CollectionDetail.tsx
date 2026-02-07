import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ChevronLeft, Loader2, Edit } from 'lucide-react';
import { cmsService } from '@/lib/cms';
import { Badge } from '@/components/ui/badge';
export function CollectionDetail() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const { data: collectionsRes } = useQuery({
    queryKey: ['collections'],
    queryFn: () => cmsService.getCollections()
  });
  const { data: entriesRes, isLoading } = useQuery({
    queryKey: ['entries', collectionId],
    queryFn: () => cmsService.getEntries(collectionId!),
    enabled: !!collectionId
  });
  const collection = useMemo(() => 
    collectionsRes?.data?.find(c => c.id === collectionId), 
    [collectionsRes, collectionId]
  );
  const entries = entriesRes?.data || [];
  if (!collection && !isLoading) return <div>Collection not found</div>;
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link to="/content" className="text-sm text-slate-500 hover:text-primary flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Back to Studio
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-white">{collection?.name}</h1>
            <p className="text-slate-400">Managing entries for {collection?.slug}</p>
          </div>
          <Link to={`/content/${collectionId}/entry`}>
            <Button className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" /> New Entry
            </Button>
          </Link>
        </div>
        <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-slate-400">Status</TableHead>
                  {collection?.fields.slice(0, 3).map(f => (
                    <TableHead key={f.name} className="text-slate-400">{f.name}</TableHead>
                  ))}
                  <TableHead className="text-slate-400">Last Updated</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-slate-500">
                      No entries found. Create your first one!
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id} className="border-white/5 hover:bg-white/5">
                      <TableCell>
                        <Badge variant={entry.status === 'published' ? 'default' : 'secondary'} className={entry.status === 'published' ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-400'}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      {collection?.fields.slice(0, 3).map(f => (
                        <TableCell key={f.name} className="text-slate-300">
                          {String(entry.data[f.name] ?? '-')}
                        </TableCell>
                      ))}
                      <TableCell className="text-slate-500">
                        {new Date(entry.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/content/${collectionId}/entry/${entry.id}`}>
                          <Button variant="ghost" size="icon" className="hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}