import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cmsService } from '@/lib/cms';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Badge } from '@/components/ui/badge';
export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: collectionsRes } = useQuery({
    queryKey: ['collections'],
    queryFn: () => cmsService.getCollections()
  });
  const collections = collectionsRes?.data || [];
  const { data: allEntries } = useQuery({
    queryKey: ['all-entries-calendar'],
    queryFn: async () => {
      const results = await Promise.all(
        collections.map(col => cmsService.getEntries(col.id))
      );
      return results.flatMap(r => r.data || []);
    },
    enabled: collections.length > 0
  });
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Content Calendar</h1>
            <p className="text-slate-400">Schedule and visualize your content pipeline.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-slate-400 hover:text-white"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-bold text-white min-w-[120px] text-center">{format(currentMonth, 'MMMM yyyy')}</span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-slate-400 hover:text-white"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-slate-900/40 p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
              {day}
            </div>
          ))}
          {days.map((day, idx) => {
            const dayEntries = allEntries?.filter(e => isSameDay(new Date(e.updatedAt), day)) || [];
            return (
              <div 
                key={day.toISOString()} 
                className={`min-h-[140px] bg-slate-900/20 p-2 transition-colors hover:bg-white/5 border-r border-b border-white/5 ${!isSameMonth(day, currentMonth) ? 'opacity-20' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-mono ${isSameDay(day, new Date()) ? 'bg-primary text-white h-6 w-6 rounded-full flex items-center justify-center' : 'text-slate-500'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayEntries.length > 0 && <Badge variant="secondary" className="bg-white/10 text-[10px] h-4">{dayEntries.length}</Badge>}
                </div>
                <div className="space-y-1">
                  {dayEntries.slice(0, 3).map((entry) => {
                    const col = collections.find(c => c.id === entry.collectionId);
                    return (
                      <div key={entry.id} className="text-[10px] p-1.5 rounded bg-white/5 border-l-2 border-primary truncate text-slate-300 group cursor-pointer hover:bg-white/10">
                        {String(entry.data[col?.fields[0]?.name || 'title'] || 'Untitled')}
                      </div>
                    );
                  })}
                  {dayEntries.length > 3 && (
                    <div className="text-[9px] text-slate-600 text-center font-bold">+{dayEntries.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-panel border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Next Scheduled</p>
                <p className="text-xl font-bold text-white">Tomorrow, 10:00 AM</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-panel border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Entries</p>
                <p className="text-xl font-bold text-white">{allEntries?.length || 0} Managed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-panel border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Filter className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Collections</p>
                <p className="text-xl font-bold text-white">{collections.length} Sources</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}