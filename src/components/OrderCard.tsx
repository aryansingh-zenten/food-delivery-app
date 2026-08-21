import { Clock, MapPin, ShoppingBag } from 'lucide-react';
import type { Order } from '@/types';
import { STATUS_LABELS } from '@/types';
import { statusColor, statusDot } from '@/lib/status';
import { formatPrice, timeAgo } from '@/lib/format';

interface OrderCardProps {
  order: Order;
  children?: React.ReactNode;
  variant?: 'compact' | 'full';
}

export function OrderCard({ order, children, variant = 'full' }: OrderCardProps) {
  return (
    <div className="card animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
            <ShoppingBag className="h-4.5 w-4.5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-stone-900">{order.customer_name}</p>
            <p className="flex items-center gap-1 text-xs text-stone-400">
              <Clock className="h-3 w-3" />
              {timeAgo(order.created_at)}
            </p>
          </div>
        </div>
        <span className={`badge ring-1 ${statusColor(order.status)}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot(order.status)}`} />
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="space-y-3 px-5 py-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Items
          </p>
          <ul className="space-y-1">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between text-sm">
                <span className="text-stone-700">
                  <span className="font-semibold text-stone-900">{item.quantity}×</span> {item.name}
                </span>
                <span className="text-stone-500">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-start gap-2 rounded-xl bg-stone-50 px-3 py-2.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-500" />
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Pickup</p>
              <p className="text-xs text-stone-600">{order.pickup_location}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-stone-50 px-3 py-2.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-none text-emerald-500" />
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Delivery</p>
              <p className="text-xs text-stone-600">{order.delivery_address}</p>
            </div>
          </div>
        </div>

        {variant === 'full' && (
          <div className="flex items-center justify-between border-t border-dashed border-stone-200 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">Total</span>
            <span className="text-base font-extrabold text-stone-900">{formatPrice(order.total)}</span>
          </div>
        )}
      </div>

      {children && <div className="border-t border-stone-100 px-5 py-4">{children}</div>}
    </div>
  );
}
