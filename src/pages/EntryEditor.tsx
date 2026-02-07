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
import { Skeleton } from '@/components/ui/skeleton';
interface FormValues {
  data: Record<string, any>;
  status: 'draft' | 'published';
}
export function EntryEditor() {
  const { collectionId, entryId } = useParams<{ collectionId: string; entryId: string }>();
  const navigate = useNavigate();
  const { data: collectionsRes, isLoading: isCollectionsLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => cmsService.getCollections()
  });
  const { data: entriesRes, isLoading: isEntryLoading } = useQuery({
    queryKey: ['entries', collectionId],
    queryFn: () => cmsService.getEntries(collectionId!),
    enabled: !!entryId && !!collectionId
  });
  const collection = useMemo(() =>
    collectionsRes?.data?.find(c => c.id === collectionId),
    [collectionsRes, collectionId]
  );
  const existingEntry = useMemo(() =>
    entriesRes?.data?.find(e => e.id === entryId),
    [entriesRes, entryId]
  );
  const form = useForm<FormValues>({
    defaultValues: { 
      data: {}, 
      status: 'draft' 
    }
  });
  useEffect(() => {
    if (existingEntry) {
      form.reset({
        data: existingEntry.data || {},
        status: existingEntry.status
      });
    } else if (collection) {
      // Initialize with schema defaults
      const defaults: Record<string, any> = {};
      collection.fields.forEach(f => {
        if (f.type === 'text') defaults[f.name] = "";
        if (f.type === 'number') defaults[f.name] = 0;
        if (f.type === 'boolean') defaults[f.name] = false;
        if (f.type === 'date') defaults[f.name] = Date.now();
      });
      form.reset({ data: defaults, status: 'draft' });
    }
  }, [existingEntry, collection, form]);
  const onSubmit = async (values: FormValues) => {
    if (!collectionId) return;
    const res = await cmsService.saveEntry({
      collectionId: collectionId,
      ...values,
      id: entryId
    });
    if (res.success) {
      navigate(`/content/${collectionId}`);
    }
  };
  if (isCollectionsLoading || (entryId && isEntryLoading)) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <Skeleton className="h-[400px] w-full rounded-2xl bg-white/5" />
        </div>
      </AppLayout>
    );
  }
  if (!collection) return (
    <AppLayout>
      <div className="text-center py-20">
        <h2 className="text-xl text-white">Collection not found</h2>
        <Link to="/content" className="text-primary hover:underline mt-4 block">Back to Studio</Link>
      </div>
    </AppLayout>
  );
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
                            <Switch 
                              checked={!!formField.value} 
                              onCheckedChange={formField.onChange} 
                            />
                          ) : field.type === 'date' ? (
                            <DatePicker 
                              date={formField.value} 
                              setDate={(date) => formField.onChange(date?.getTime())} 
                            />
                          ) : field.type === 'number' ? (
                            <Input
                              type="number"
                              className="bg-white/5 border-white/10 text-white"
                              value={formField.value ?? ""}
                              onChange={(e) => formField.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                            />
                          ) : (
                            <Input 
                              className="bg-white/5 border-white/10 text-white" 
                              {...formField} 
                              value={formField.value ?? ""}
                            />
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
                        <FormLabel className="text-white">Published</FormLabel>
                        <p className="text-xs text-slate-500">Only published entries are visible via the Public API.</p>
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
                  <Save className="h-4 w-4 mr-2" /> {entryId ? 'Update' : 'Save'} Entry
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}