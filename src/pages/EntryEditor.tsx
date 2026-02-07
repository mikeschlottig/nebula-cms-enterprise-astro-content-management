import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { cmsService } from '@/lib/cms';
import { DatePicker } from '@/components/ui/date-picker';
export function EntryEditor() {
  const { collectionId, entryId } = useParams<{ collectionId: string; entryId: string }>();
  const navigate = useNavigate();
  const { data: collectionsRes } = useQuery({
    queryKey: ['collections'],
    queryFn: () => cmsService.getCollections()
  });
  const { data: entriesRes, isLoading: isEntryLoading } = useQuery({
    queryKey: ['entries', collectionId],
    queryFn: () => cmsService.getEntries(collectionId!),
    enabled: !!entryId
  });
  const collection = useMemo(() => 
    collectionsRes?.data?.find(c => c.id === collectionId), 
    [collectionsRes, collectionId]
  );
  const existingEntry = useMemo(() => 
    entriesRes?.data?.find(e => e.id === entryId),
    [entriesRes, entryId]
  );
  const form = useForm({
    defaultValues: { data: {}, status: 'draft' as const }
  });
  useEffect(() => {
    if (existingEntry) {
      form.reset({
        data: existingEntry.data,
        status: existingEntry.status
      });
    }
  }, [existingEntry, form]);
  const onSubmit = async (values: any) => {
    const res = await cmsService.saveEntry({
      collectionId: collectionId!,
      ...values,
      id: entryId
    });
    if (res.success) {
      navigate(`/content/${collectionId}`);
    }
  };
  if (!collection) return <div>Collection not found</div>;
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link to={`/content/${collectionId}`} className="text-sm text-slate-500 hover:text-primary flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Back to Entries
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {entryId ? 'Edit Entry' : 'New Entry'}
            </h1>
            <p className="text-slate-400">Collection: {collection.name}</p>
          </div>
        </div>
        <div className="glass-panel p-8 rounded-2xl border-white/5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                {collection.fields.map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={`data.${field.name}`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel className="capitalize text-slate-300">{field.name}</FormLabel>
                        <FormControl>
                          {field.type === 'boolean' ? (
                            <Switch checked={formField.value} onCheckedChange={formField.onChange} />
                          ) : field.type === 'date' ? (
                            <DatePicker date={formField.value} setDate={formField.onChange} />
                          ) : field.type === 'number' ? (
                            <Input 
                              type="number" 
                              className="bg-white/5 border-white/10 text-white" 
                              {...formField} 
                              onChange={(e) => formField.onChange(Number(e.target.value))} 
                            />
                          ) : (
                            <Input className="bg-white/5 border-white/10 text-white" {...formField} />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-white">Publish immediately</FormLabel>
                        <p className="text-xs text-slate-500">If disabled, this entry will remain as a draft.</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 'published'}
                          onCheckedChange={(checked) => field.onChange(checked ? 'published' : 'draft')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-4 border-t border-white/5 pt-8">
                <Button type="button" variant="ghost" onClick={() => navigate(`/content/${collectionId}`)}>Cancel</Button>
                <Button type="submit" className="btn-gradient min-w-[120px]">
                  <Save className="h-4 w-4 mr-2" /> Save Entry
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}