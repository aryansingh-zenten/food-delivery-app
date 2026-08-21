import { useMemo, useState } from 'react';
import { Bike, Loader2, PackageCheck, MapPin, Navigation, Home, Route } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import type { OrderStatus } from '@/types';
import { STATUS_LABELS } from '@/types';
import { formatPrice, timeAgo } from '@/lib/format';
import { statusColor, statusDot } from '@/lib/status';

export function DeliveryDashboard() {
  const { orders, loading, error, updateStatus } = useOrders();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const available = useMemo(
    () => orders.filter((o) => o.status === 'ready'),
    [orders],
  );
  const active = useMemo(
    () => orders.filter((o) => o.status === 'picked_up'),
    [orders],
  );
  const completed = useMemo(
    () => orders.filter((o) => o.status === 'delivered'),
    [orders],
  );

  async function handleAction(id: string, status: OrderStatus) {
    setBusyId(id);
    setActionError(null);
    try {
      await updateStatus(id, status);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to update order.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-soft">
            <Bike className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-stone-900">Delivery Partner</h1>
            <p className="text-xs text-stone-400">Pick up ready orders and deliver them</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
          <Stat label="Available" value={available.length} tone="emerald" />
          <Stat label="On the way" value={active.length} tone="cyan" />
          <Stat label="Delivered" value={completed.length} tone="stone" />
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {actionError}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20 text-stone-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading deliveries…
        </div>
      )}
      {error && (
        <div className="card px-5 py-8 text-center text-sm text-red-600">
          Couldn&apos;t load deliveries: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Available for pickup */}
          <section>
            <SectionHeader
              icon={PackageCheck}
              title="Ready for Pickup"
              subtitle="Orders waiting at the restaurant"
              count={available.length}
              tone="emerald"
            />
            <div className="space-y-4">
              {available.length === 0 && <EmptyState message="No orders ready for pickup yet." />}
              {available.map((order) => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  busy={busyId === order.id}
                  onAction={() => handleAction(order.id, 'picked_up')}
                  actionLabel="Mark Picked Up"
                  actionIcon={Navigation}
                  actionTone="cyan"
                />
              ))}
            </div>
          </section>

          {/* Out for delivery */}
          <section>
            <SectionHeader
              icon={Route}
              title="Out for Delivery"
              subtitle="Orders you've picked up"
              count={active.length}
              tone="cyan"
            />
            <div className="space-y-4">
              {active.length === 0 && (
                <EmptyState message="You haven't picked up any orders yet." />
              )}
              {active.map((order) => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  busy={busyId === order.id}
                  onAction={() => handleAction(order.id, 'delivered')}
                  actionLabel="Mark Delivered"
                  actionIcon={Home}
                  actionTone="stone"
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Recently delivered */}
      {!loading && !error && completed.length > 0 && (
        <section className="mt-8">
          <SectionHeader
            icon={Home}
            title="Recently Delivered"
            subtitle="Completed deliveries"
            count={completed.length}
            tone="stone"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((order) => (
              <div key={order.id} className="card flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-stone-900">{order.customer_name}</p>
                  <p className="truncate text-xs text-stone-400">{order.delivery_address}</p>
                </div>
                <div className="ml-3 flex flex-none flex-col items-end">
                  <span className="text-sm font-bold text-stone-700">{formatPrice(order.total)}</span>
                  <span className="text-[10px] text-stone-400">{timeAgo(order.updated_at || order.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  count,
  tone,
}: {
  icon: typeof Bike;
  title: string;
  subtitle: string;
  count: number;
  tone: 'emerald' | 'cyan' | 'stone';
}) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    stone: 'bg-stone-100 text-stone-500',
  };
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <h2 className="text-sm font-bold text-stone-900">{title}</h2>
        <p className="text-xs text-stone-400">{subtitle}</p>
      </div>
      <span className="badge bg-stone-100 text-stone-600">{count}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-10 text-center text-stone-400">
      <Bike className="mb-2 h-8 w-8 text-stone-300" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

function DeliveryCard({
  order,
  busy,
  onAction,
  actionLabel,
  actionIcon: Icon,
  actionTone,
}: {
  order: import('@/types').Order;
  busy: boolean;
  onAction: () => void;
  actionLabel: string;
  actionIcon: typeof Bike;
  actionTone: 'cyan' | 'stone';
}) {
  return (
    <div className="card animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-3.5">
        <div className="leading-tight">
          <p className="text-sm font-bold text-stone-900">{order.customer_name}</p>
          <p className="text-xs text-stone-400">{timeAgo(order.created_at)}</p>
        </div>
        <span className={`badge ring-1 ${statusColor(order.status)}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot(order.status)}`} />
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="space-y-3 px-5 py-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3 py-2.5">
            <MapPin className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pickup</p>
              <p className="text-sm text-stone-700">{order.pickup_location}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-3 py-2.5">
            <MapPin className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Delivery</p>
              <p className="text-sm text-stone-700">{order.delivery_address}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-dashed border-stone-200 pt-3">
          <div className="text-xs text-stone-500">
            {order.items.reduce((s, i) => s + i.quantity, 0)} items
          </div>
          <span className="text-base font-extrabold text-stone-900">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="border-t border-stone-100 px-5 py-4">
        <button
          onClick={onAction}
          disabled={busy}
          className={`btn w-full active:scale-[0.98] ${
            actionTone === 'cyan'
              ? 'bg-cyan-500 text-white hover:bg-cyan-600'
              : 'bg-stone-700 text-white hover:bg-stone-800'
          }`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
          {busy ? 'Updating…' : actionLabel}
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'emerald' | 'cyan' | 'stone';
}) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    stone: 'bg-stone-100 text-stone-600 ring-stone-200',
  };
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 ring-1 ${tones[tone]}`}>
      <span className="text-lg font-extrabold leading-none">{value}</span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</span>
    </div>
  );
}
