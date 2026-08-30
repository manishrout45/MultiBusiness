import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export function Reviews({ reviews }: { reviews: ReviewItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{review.author}</p>
                <span className="inline-flex items-center gap-1 text-sm">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {review.rating.toFixed(1)}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
