import { Check } from 'lucide-react';
import type { OrderStatus } from '@/types';
import { ORDER_STATUSES, STATUS_LABELS, STATUS_DESCRIPTIONS } from '@/types';
import { statusDot } from '@/lib/status';

interface OrderTrackerProps {
  status: OrderStatus;
}

export function OrderTracker({ status }: OrderTrackerProps) {
  const currentIndex = ORDER_STATUSES.indexOf(status);

  return (
    <div className="space-y-4">
      <ol className="relative flex flex-col gap-3">
        {ORDER_STATUSES.map((step, idx) => {
          const isFinalComplete = idx === currentIndex && idx === ORDER_STATUSES.length - 1;
          const done = idx < currentIndex || isFinalComplete;
          const active = idx === currentIndex && !isFinalComplete;
          return (
            <li key={step} className="flex items-start gap-3">
              <div className="relative flex h-7 w-7 flex-none items-center justify-center">
                {idx < ORDER_STATUSES.length - 1 && (
                  <span
                    className={`absolute top-7 left-1/2 h-[calc(100%+0.25rem)] w-0.5 -translate-x-1/2 ${
                      done ? 'bg-brand-400' : 'bg-stone-200'
                    }`}
                  />
                )}
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full ring-2 transition-all duration-300 ${
                    done
                      ? 'bg-brand-500 text-white ring-brand-500'
                      : active
                        ? `bg-white ${statusDot(step)} ring-current animate-pulse-soft`
                        : 'bg-stone-100 text-stone-300 ring-stone-200'
                  }`}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className={`h-2 w-2 rounded-full ${active ? statusDot(step) : 'bg-stone-300'}`} />
                  )}
                </span>
              </div>
              <div className={`pt-0.5 ${done || active ? '' : 'opacity-60'}`}>
                <p
                  className={`text-sm font-semibold ${
                    active ? 'text-stone-900' : done ? 'text-stone-700' : 'text-stone-400'
                  }`}
                >
                  {STATUS_LABELS[step]}
                  {active && <span className="ml-2 text-xs font-medium text-brand-600">in progress</span>}
                </p>
                <p className="text-xs text-stone-400">{STATUS_DESCRIPTIONS[step]}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
