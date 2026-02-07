import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cloudflareService } from '@/lib/cloudflare';
import { Database, Table, Play, Terminal, Search, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
export function D1Explorer() {
  const [query, setQuery] = useState('SELECT * FROM entries LIMIT 10;');
  const { data: dbs } = useQuery({
    queryKey: ['d1-databases'],
    queryFn: () => cloudflareService.getD1Databases()
  });
  const { data: results, refetch: runSql } = useQuery({
    queryKey: ['sql-query'],
    queryFn: () => cloudflareService.runQuery(query),
    enabled: false
  });
  return (
    <AppLayout container={false} className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="w-72 border-r border-white/5 bg-black/20 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> D1 Console
          </h2>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {dbs?.map(db => (
              <div key={db.uuid} className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase px-2">{db.name}</p>
                {db.tables.map(table => (
                  <button key={table} className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-md flex items-center gap-2">
                    <Table className="h-3 w-3" /> {table}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-1/2 flex flex-col border-b border-white/5">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Terminal className="h-4 w-4" /> SQL Editor
            </div>
            <Button size="sm" onClick={() => runSql()} className="btn-gradient">
              <Play className="h-3 w-3 mr-2" /> Run Query
            </Button>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-[#0B0F1A] p-4 font-mono text-sm text-blue-300 outline-none resize-none"
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-500">Query Results ({results?.length || 0} rows)</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="px-2 h-7 text-[10px]">Export JSON</Button>
              <Button variant="ghost" size="sm" className="px-2 h-7 text-[10px]">Export CSV</Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-0">
              {results ? (
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      {Object.keys(results[0] || {}).map(k => (
                        <th key={k} className="p-3 font-medium text-slate-400 capitalize">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        {Object.values(row).map((v: any, j) => (
                          <td key={j} className="p-3 font-mono text-xs text-slate-300">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                  <Info className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Enter a query above and click 'Run Query'</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AppLayout>
  );
}