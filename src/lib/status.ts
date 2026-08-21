import type { OrderStatus } from '@/types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 ring-amber-200',
  accepted: 'bg-blue-100 text-blue-700 ring-blue-200',
  preparing: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  ready: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  picked_up: 'bg-cyan-100 text-cyan-700 ring-cyan-200',
  delivered: 'bg-stone-200 text-stone-600 ring-stone-300',
};

export function statusColor(status: OrderStatus): string {
  return STATUS_COLORS[status] ?? 'bg-stone-100 text-stone-600 ring-stone-200';
}

export function statusDot(status: OrderStatus): string {
  const dot: Record<OrderStatus, string> = {
    pending: 'bg-amber-500',
    accepted: 'bg-blue-500',
    preparing: 'bg-indigo-500',
    ready: 'bg-emerald-500',
    picked_up: 'bg-cyan-500',
    delivered: 'bg-stone-400',
  };
  return dot[status] ?? 'bg-stone-400';
}
