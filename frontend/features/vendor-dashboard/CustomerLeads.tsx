'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import type { CustomerLead } from '@/services/dashboardService';
import { Users } from 'lucide-react';

interface CustomerLeadsProps {
  leads: CustomerLead[];
  isLoading?: boolean;
}

export function CustomerLeads({ leads, isLoading }: CustomerLeadsProps) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Customer leads</CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <EmptyState
            title="No leads yet"
            description="Product visitors and inquiries will appear here."
            icon={<Users className="size-8" />}
            className="border-0 bg-transparent py-8"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Contact</th>
                  <th className="pb-2 font-medium">Inquiry</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium">{lead.customerName}</td>
                    <td className="py-3 text-muted-foreground">{lead.contact}</td>
                    <td className="py-3">{lead.productInquiry}</td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(lead.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
