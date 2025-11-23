"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";

export type Option = {
  label: string;
  value: string;
};

interface SmartSelectProps {
  options: Option[];
  selected: string[];         // Always array for consistency
  onChange: (value: string[]) => void;

  placeholder?: string;
  disabled?: boolean;

  isMulti?: boolean;          // 👈 IMPORTANT: enabling multi selection
  className?: string;
}

export function SmartSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  disabled = false,
  isMulti = false,            // 👈 default single-select
  className,
}: SmartSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleValue = (value: string) => {
    if (isMulti) {
      // MULTI SELECT MODE
      if (selected?.includes(value)) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      // SINGLE SELECT MODE
      if (selected?.includes(value)) return;
      onChange([value]); // overwrite
      setOpen(false); // close dropdown
    }
  };

  const selectedLabels = options
    .filter((opt) => selected?.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between rounded-md border px-3 py-2 bg-background hover:bg-accent cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <div className="flex flex-wrap gap-1">
          {selectedLabels.length === 0 && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}

          {/* MULTI SELECT BADGES */}
          {isMulti &&
            selectedLabels.map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                {label}
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    const opt = options.find((o) => o.label === label);
                    if (opt) toggleValue(opt.value);
                  }}
                />
              </Badge>
            ))}

          {/* SINGLE SELECT TEXT */}
          {!isMulti && selectedLabels[0] && selectedLabels[0]}
        </div>

        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />

          <CommandList>
            <CommandGroup>
              {options.map((opt) => {
                const checked = selected.includes(opt.value);

                return (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => toggleValue(opt.value)}
                    className="cursor-pointer"
                  >
                    {isMulti && (
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          checked ? "opacity-100" : "opacity-0"
                        )}
                      />
                    )}

                    {opt.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
