import { useMemo, useState } from 'react';
import { Store, Loader2, Check, ChefHat, PackageCheck, Bell } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import type { OrderStatus } from '@/types';
import { OrderCard } from '@/components/OrderCard';
import { formatPrice } from '@/lib/format';
import { statusColor, statusDot } from '@/lib/status';

const TABS: { id: OrderStatus | 'active'; label: string; statuses: OrderStatus[] }[] = [
  { id: 'pending', label: 'New', statuses: ['pending'] },
  { id: 'active', label: 'In Kitchen', statuses: ['accepted', 'preparing'] },
  { id: 'ready', label: 'Ready', statuses: ['ready'] },
  { id: 'delivered', label: 'Done', statuses: ['picked_up', 'delivered'] },
];

export function RestaurantDashboard() {
  const { orders, loading, error, updateStatus } = useOrders();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, active: 0, ready: 0, delivered: 0 };
    for (const o of orders) {
      if (o.status === 'pending') c.pending++;
      else if (o.status === 'accepted' || o.status === 'preparing') c.active++;
      else if (o.status === 'ready') c.ready++;
      else c.delivered++;
    }
    return c;
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const tab = TABS.find((t) => t.id === activeTab)!;
    return orders.filter((o) => tab.statuses.includes(o.status));
  }, [orders, activeTab]);

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
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-soft">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-stone-900">Bolt Kitchen</h1>
              <p className="text-xs text-stone-400">Restaurant order dashboard</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:flex sm:gap-3">
          <Stat label="New" value={counts.pending} tone="amber" />
          <Stat label="In Kitchen" value={counts.active} tone="blue" />
          <Stat label="Ready" value={counts.ready} tone="emerald" />
          <Stat label="Done" value={counts.delivered} tone="stone" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5 rounded-2xl bg-stone-100 p-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const count = counts[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                active ? 'bg-white text-stone-900 shadow-soft' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold ${
                    active ? 'bg-brand-100 text-brand-700' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {actionError && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {actionError}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20 text-stone-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading orders…
        </div>
      )}
      {error && (
        <div className="card px-5 py-8 text-center text-sm text-red-600">
          Couldn&apos;t load orders: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleOrders.length === 0 && (
            <div className="col-span-full card flex flex-col items-center justify-center px-6 py-16 text-center text-stone-400">
              <Bell className="mb-3 h-10 w-10 text-stone-300" />
              <p className="text-sm font-medium">No orders here right now.</p>
              <p className="text-xs">New orders from customers will appear in real time.</p>
            </div>
          )}
          {visibleOrders.map((order) => {
            const isBusy = busyId === order.id;
            return (
              <OrderCard key={order.id} order={order}>
                <div className="flex flex-wrap items-center gap-2">
                  {order.status === 'pending' && (
                    <>
                      <ActionButton
                        onClick={() => handleAction(order.id, 'accepted')}
                        disabled={isBusy}
                        tone="primary"
                        icon={Check}
                        label="Accept"
                      />
                      <span className="text-xs text-stone-400">
                        Accept to start preparing this order.
                      </span>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <ActionButton
                      onClick={() => handleAction(order.id, 'preparing')}
                      disabled={isBusy}
                      tone="blue"
                      icon={ChefHat}
                      label="Start Preparing"
                    />
                  )}
                  {order.status === 'preparing' && (
                    <ActionButton
                      onClick={() => handleAction(order.id, 'ready')}
                      disabled={isBusy}
                      tone="emerald"
                      icon={PackageCheck}
                      label="Mark Ready for Pickup"
                    />
                  )}
                  {(order.status === 'ready' || order.status === 'picked_up' || order.status === 'delivered') && (
                    <p className="flex items-center gap-2 text-sm font-medium text-stone-500">
                      <span className={`h-2 w-2 rounded-full ${statusDot(order.status)}`} />
                      Handed off to delivery. Total {formatPrice(order.total)}.
                    </p>
                  )}
                  {isBusy && (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin text-stone-400" />
                  )}
                </div>
              </OrderCard>
            );
          })}
        </div>
      )}
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
  tone: 'amber' | 'blue' | 'emerald' | 'stone';
}) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    stone: 'bg-stone-100 text-stone-600 ring-stone-200',
  };
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 ring-1 ${tones[tone]}`}>
      <span className="text-lg font-extrabold leading-none">{value}</span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</span>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  tone,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  tone: 'primary' | 'blue' | 'emerald';
  icon: typeof Check;
  label: string;
}) {
  const tones = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    blue: 'bg-blue-500 text-white hover:bg-blue-600',
    emerald: 'bg-emerald-500 text-white hover:bg-emerald-600',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${tones[tone]} active:scale-[0.98]`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
