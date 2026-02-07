import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
export function DatePicker({ 
  date, 
  setDate, 
  className 
}: { 
  date?: Date | number; 
  setDate: (date?: Date) => void;
  className?: string;
}) {
  const selectedDate = date ? new Date(date) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-slate-900 border-white/10" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setDate}
          initialFocus
          className="text-white"
        />
      </PopoverContent>
    </Popover>
  );
}