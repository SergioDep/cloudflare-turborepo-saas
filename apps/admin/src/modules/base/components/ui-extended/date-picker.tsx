"use client";

import React, { useEffect, useState } from "react";
import {
  FloatingInput,
  FloatingLabel,
} from "@/modules/base/components/ui-extended/floating-label-input";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { LucideCalendar } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";

type DatePickerProps = {
  name: string;
  disabled?: boolean;
  displayType?: "input" | "calendar";
  value?: Date;
  onValueChange(value: Date): void;
  fromDate?: Date;
  toDate?: Date;
  label?: string;
  required?: boolean;
};

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    { name, disabled, value, onValueChange, fromDate, toDate, label, required },
    ref,
  ) => {
    const [stringDate, setStringDate] = useState(
      value instanceof Date && !isNaN(value.getTime())
        ? format(value, "yyyy-MM-dd")
        : "",
    );

    useEffect(() => {
      if (value instanceof Date && !isNaN(value.getTime())) {
        setStringDate(format(value, "yyyy-MM-dd"));
        inputRef.current?.removeAttribute("data-placeholder");
      } else {
        inputRef.current?.setAttribute("data-placeholder", "");
      }
    }, [value]);

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    return (
      <Popover key={name}>
        <div className="relative flex items-center">
          <FloatingInput
            id={name}
            required={required}
            className="rounded-l-none data-[placeholder]:text-transparent"
            type="date"
            disabled={disabled}
            name={name}
            min={fromDate ? format(fromDate, "yyyy-MM-dd") : undefined}
            max={toDate ? format(toDate, "yyyy-MM-dd") : undefined}
            ref={(el) => {
              inputRef.current = el;
              if (ref) {
                if (typeof ref === "function") {
                  ref(el);
                } else {
                  ref.current = el;
                }
              }
            }}
            value={stringDate}
            onChange={(e) => {
              const newValue = e.target.value;
              setStringDate(e.target.value);
              if (newValue) {
                onValueChange(parseISO(e.target.value));
              }
            }}
            data-placeholder=""
            onFocus={() => {
              if (inputRef.current) {
                inputRef.current?.removeAttribute("data-placeholder");
              }
            }}
            onBlur={() => {
              if (inputRef.current && !stringDate) {
                inputRef.current.setAttribute("data-placeholder", "");
              }
            }}
          />
          <FloatingLabel htmlFor={name} className="">
            {label}
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className={cn(
                  "pointer-events-auto absolute right-0 top-1/2 z-20 m-0 h-8 w-8 -translate-y-1/2 translate-x-8 border bg-muted font-normal",
                  disabled && "cursor-not-allowed text-muted-foreground",
                )}
              >
                <LucideCalendar className="h-8 w-8" />
                <span className="sr-only">Open Calendar</span>
              </Button>
            </PopoverTrigger>
          </FloatingLabel>
        </div>
        <PopoverContent align="end" className="w-auto bg-background p-0">
          <Calendar
            disabled={disabled}
            mode="single"
            locale={es}
            captionLayout="dropdown"
            selected={value}
            defaultMonth={value?.getTime() ? value : new Date()}
            onSelect={(selectedDate) => {
              if (!selectedDate) return;
              onValueChange(selectedDate);
              setStringDate(format(selectedDate, "yyyy-MM-dd"));
              inputRef.current?.removeAttribute("data-placeholder");
            }}
            fromDate={fromDate}
            toDate={toDate}
          />
        </PopoverContent>
      </Popover>
    );
  },
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
