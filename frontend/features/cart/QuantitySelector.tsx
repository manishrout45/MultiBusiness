'use client';

import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onChange,
  disabled,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-none"
        disabled={disabled || quantity <= min}
        onClick={() => onChange(Math.max(min, quantity - 1))}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </Button>
      <motion.span
        key={quantity}
        initial={{ scale: 0.85, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        className="min-w-8 text-center text-sm font-medium tabular-nums"
      >
        {quantity}
      </motion.span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-none"
        disabled={disabled || quantity >= max}
        onClick={() => onChange(Math.min(max, quantity + 1))}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
