import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { cmsService } from "@/lib/cms";
const schema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphenated"),
  fields: z.array(z.object({
    name: z.string().min(1, "Field name is required"),
    type: z.enum(["text", "number", "boolean", "date"])
  })).min(1, "At least one field is required")
});
type SchemaFormValues = z.infer<typeof schema>;
interface SchemaBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
export function SchemaBuilder({ open, onOpenChange, onSuccess }: SchemaBuilderProps) {
  const form = useForm<SchemaFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", fields: [{ name: "title", type: "text" }] }
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields"
  });
  const onSubmit = async (values: SchemaFormValues) => {
    const res = await cmsService.createCollection(values);
    if (res.success) {
      form.reset();
      onSuccess();
      onOpenChange(false);
    }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md bg-slate-900 border-white/10 text-white overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">New Collection</SheetTitle>
          <SheetDescription className="text-slate-400">
            Define the structure of your content.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Blog Posts" className="bg-white/5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL Identifier)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. blog-posts" className="bg-white/5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Fields</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", type: "text" })}>
                  <Plus className="h-4 w-4 mr-2" /> Add Field
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`fields.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Field Name" className="bg-white/5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`fields.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <SheetFooter className="pt-6">
              <Button type="submit" className="w-full btn-gradient">Create Collection</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}