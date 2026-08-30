'use client';

import { motion } from 'framer-motion';
import { CreditCard, Landmark, Smartphone, Wallet } from 'lucide-react';
import { PAYMENT_METHODS, type PaymentMethodId } from '@/lib/constants';
import { cn } from '@/lib/utils';

const ICONS: Record<PaymentMethodId, typeof CreditCard> = {
  upi: Smartphone,
  credit_card: CreditCard,
  debit_card: CreditCard,
  net_banking: Landmark,
  cod: Wallet,
};

interface PaymentMethodProps {
  value: PaymentMethodId;
  onChange: (method: PaymentMethodId) => void;
}

export function PaymentMethod({ value, onChange }: PaymentMethodProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PAYMENT_METHODS.map((method) => {
        const Icon = ICONS[method.id];
        const selected = value === method.id;

        return (
          <motion.button
            key={method.id}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(method.id)}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
              selected
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-primary/40'
            )}
          >
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-lg',
                selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{method.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{method.description}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
