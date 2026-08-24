'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { RatingStars } from '@/features/reviews/RatingStars';
import { reviewService } from '@/services/reviewService';

interface ReviewFormProps {
  businessId: string;
  businessName: string;
  products?: { id: string; name: string }[];
  onSubmitted?: () => void;
}

export function ReviewForm({ businessId, businessName, products = [], onSubmitted }: ReviewFormProps) {
  const { token, user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [productId, setProductId] = useState<string>('business');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) {
      toast({ title: 'Write a review', description: 'Please share your feedback.', variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProduct = products.find((p) => p.id === productId);
      await reviewService.submitReview(
        {
          businessId,
          productId: productId === 'business' ? undefined : productId,
          productName: selectedProduct?.name,
          rating,
          comment: comment.trim(),
          userName: user?.name ?? 'Guest customer',
        },
        token
      );
      setComment('');
      setRating(5);
      toast({ title: 'Review submitted', description: 'Thank you for your feedback!', variant: 'success' });
      onSubmitted?.();
    } catch (err) {
      toast({
        title: 'Could not submit review',
        description: err instanceof Error ? err.message : 'Try again later.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Write a review</CardTitle>
        <p className="text-sm text-muted-foreground">Share your experience with {businessName}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <RatingStars value={rating} onChange={setRating} />
          </div>

          {products.length > 0 && (
            <div className="space-y-2">
              <Label>Review type</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Overall business</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      Product: {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">Your feedback</Label>
            <Textarea
              id="comment"
              rows={4}
              placeholder="What did you like? What could be better?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground">
              Reviews are saved locally when not signed in. Sign in to sync with your account.
            </p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
