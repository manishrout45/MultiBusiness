'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WEEKDAYS, type Weekday } from '@/lib/constants';
import type { WorkingHours } from '@/features/vendor';

interface WorkingHoursFormProps {
  value: WorkingHours;
  onChange: (next: WorkingHours) => void;
  onSubmit: () => void;
  pending?: boolean;
}

export function WorkingHoursForm({ value, onChange, onSubmit, pending }: WorkingHoursFormProps) {
  const updateDay = (day: Weekday, patch: Partial<WorkingHours[Weekday]>) => {
    onChange({ ...value, [day]: { ...value[day], ...patch } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working hours</CardTitle>
        <CardDescription>Set when customers can reach your business.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="grid grid-cols-1 items-center gap-3 rounded-xl border border-border/70 p-3 sm:grid-cols-[120px_1fr_1fr_auto]"
            >
              <Label className="capitalize">{day}</Label>
              <Input
                type="time"
                disabled={value[day].closed}
                value={value[day].open}
                onChange={(e) => updateDay(day, { open: e.target.value })}
              />
              <Input
                type="time"
                disabled={value[day].closed}
                value={value[day].close}
                onChange={(e) => updateDay(day, { close: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={value[day].closed}
                  onChange={(e) => updateDay(day, { closed: e.target.checked })}
                />
                Closed
              </label>
            </div>
          ))}
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save working hours'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export { WorkingHoursForm as WorkingHours };
