'use client';

import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type StudioSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

const EMPTY_VALUE = '__studio_empty__';

function toSelectValue(value: string | undefined) {
  return value ? value : EMPTY_VALUE;
}

function fromSelectValue(value: string | null) {
  return !value || value === EMPTY_VALUE ? '' : value;
}

export function StudioSelectField({
  name,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder = 'Select an option',
  className,
  disabled
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: StudioSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const resolvedValue = controlled ? value ?? '' : internalValue;

  const update = (nextValue: string | null) => {
    const normalized = fromSelectValue(nextValue);
    if (!controlled) setInternalValue(normalized);
    onValueChange?.(normalized);
  };

  return (
    <Select
      value={toSelectValue(resolvedValue)}
      onValueChange={update}
      disabled={disabled}
    >
      {name ? (
        <input type="hidden" name={name} value={resolvedValue} readOnly />
      ) : null}
      <SelectTrigger
        className={cn(
          'h-11 w-full rounded-2xl border-border/70 bg-background/75 px-3 text-sm shadow-none',
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent align="start">
        {options.map(option => (
          <SelectItem
            key={option.value || EMPTY_VALUE}
            value={toSelectValue(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
