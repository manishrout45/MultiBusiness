'use client';

import { CommissionTable } from '@/features/commission';

export function CommissionManagement() {
  return (
    <section id="commissions" className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Commission management</h2>
        <p className="text-sm text-muted-foreground">
          Set commission percentages and track platform earnings by vendor.
        </p>
      </div>
      <CommissionTable />
    </section>
  );
}
