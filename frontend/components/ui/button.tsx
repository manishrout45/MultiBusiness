import { type ClassValue, clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-brand-gradient text-primary-foreground shadow hover:opacity-90',
        primary:
          'bg-brand-gradient text-primary-foreground shadow hover:opacity-90',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        'outline-primary':
          'border border-primary/40 bg-background text-primary shadow-sm hover:bg-primary hover:text-primary-foreground',
        'outline-secondary':
          'border border-secondary-foreground/20 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/70',
        success: 'bg-success text-success-foreground shadow hover:bg-success/90',
        danger: 'bg-danger text-danger-foreground shadow hover:bg-danger/90',
        destructive: 'bg-danger text-danger-foreground shadow hover:bg-danger/90',
        warning: 'bg-warning text-warning-foreground shadow hover:bg-warning/90',
        info: 'bg-info text-info-foreground shadow hover:bg-info/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
