import { useState } from 'react';
import { Star, Loader2, CheckCircle2, UtensilsCrossed, Bike } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FeedbackCardProps {
  orderId: string;
}

export function FeedbackCard({ orderId }: FeedbackCardProps) {
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [restaurantComment, setRestaurantComment] = useState('');
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [deliveryComment, setDeliveryComment] = useState('');
  const [hoverRestaurant, setHoverRestaurant] = useState(0);
  const [hoverDelivery, setHoverDelivery] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (restaurantRating === 0 || deliveryRating === 0) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('order_feedback').insert({
      order_id: orderId,
      restaurant_rating: restaurantRating,
      restaurant_comment: restaurantComment.trim() || null,
      delivery_rating: deliveryRating,
      delivery_comment: deliveryComment.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      setError('Could not save your feedback. Please try again.');
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700 ring-1 ring-emerald-100 animate-fade-in">
        <CheckCircle2 className="h-5 w-5 flex-none" />
        <p className="text-sm font-semibold">Thank you for your feedback!</p>
      </div>
    );
  }

  const canSubmit = restaurantRating > 0 && deliveryRating > 0 && !submitting;

  return (
    <div className="mt-3 rounded-xl bg-brand-50/50 p-4 ring-1 ring-brand-100 animate-fade-in">
      <p className="mb-3 text-sm font-bold text-stone-900">How was your experience?</p>

      <div className="space-y-4">
        {/* Restaurant & food quality */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-brand-600" />
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Restaurant & Food Quality
            </label>
          </div>
          <StarRating
            value={restaurantRating}
            hover={hoverRestaurant}
            onRate={setRestaurantRating}
            onHover={setHoverRestaurant}
          />
          <textarea
            value={restaurantComment}
            onChange={(e) => setRestaurantComment(e.target.value)}
            placeholder="Tell us about the food…"
            rows={2}
            className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {/* Delivery partner experience */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <Bike className="h-4 w-4 text-brand-600" />
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Delivery Partner Experience
            </label>
          </div>
          <StarRating
            value={deliveryRating}
            hover={hoverDelivery}
            onRate={setDeliveryRating}
            onHover={setHoverDelivery}
          />
          <textarea
            value={deliveryComment}
            onChange={(e) => setDeliveryComment(e.target.value)}
            placeholder="Tell us about the delivery…"
            rows={2}
            className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
      )}

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="btn-primary mt-3 w-full"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
          </>
        ) : (
          <>Submit Feedback</>
        )}
      </button>
    </div>
  );
}

function StarRating({
  value,
  hover,
  onRate,
  onHover,
}: {
  value: number;
  hover: number;
  onRate: (v: number) => void;
  onHover: (v: number) => void;
}) {
  return (
    <div className="flex gap-1" onMouseLeave={() => onHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                filled
                  ? 'fill-brand-400 text-brand-400'
                  : 'fill-stone-100 text-stone-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
