import { useMemo, useState } from 'react';
import { Plus, Minus, Search, ShoppingCart, X, MapPin, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { useOrders } from '@/hooks/useOrders';
import { supabase } from '@/lib/supabase';
import type { MenuItem, Order, OrderItem } from '@/types';
import { STATUS_LABELS } from '@/types';
import { formatPrice } from '@/lib/format';
import { statusColor, statusDot } from '@/lib/status';
import { OrderTracker } from '@/components/OrderTracker';
import { FeedbackCard } from '@/components/FeedbackCard';

interface CartEntry {
  item: MenuItem;
  quantity: number;
}

const PICKUP_LOCATION = 'Bolt Kitchen — 88 Market Street, Downtown';

export function CustomerPortal() {
  const { items, loading, error } = useMenu();
  const { orders, updateStatus } = useOrders();
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [justPlacedId, setJustPlacedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ['All', ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchesCategory = activeCategory === 'All' || i.category === activeCategory;
      const matchesSearch =
        search.trim() === '' ||
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch && i.available;
    });
  }, [items, activeCategory, search]);

  const cartList = Object.values(cart);
  const cartCount = cartList.reduce((sum, e) => sum + e.quantity, 0);
  const cartTotal = cartList.reduce((sum, e) => sum + e.quantity * e.item.price, 0);

  const myOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [orders]);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: { item, quantity: (existing?.quantity ?? 0) + 1 },
      };
    });
  }

  function decrement(id: string) {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const nextQty = existing.quantity - 1;
      if (nextQty <= 0) {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { ...existing, quantity: nextQty } };
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function clearCart() {
    setCart({});
  }

  async function placeOrder() {
    if (!customerName.trim() || !deliveryAddress.trim() || cartList.length === 0) return;
    setPlacing(true);
    setPlaceError(null);
    const orderItems: OrderItem[] = cartList.map((e) => ({
      name: e.item.name,
      quantity: e.quantity,
      price: e.item.price,
    }));
    const { data, error } = await supabase
      .from('orders')
      .insert({
        status: 'pending',
        customer_name: customerName.trim(),
        delivery_address: deliveryAddress.trim(),
        pickup_location: PICKUP_LOCATION,
        items: orderItems,
        total: cartTotal,
      })
      .select()
      .single();
    setPlacing(false);
    if (error || !data) {
      setPlaceError(error?.message ?? 'Could not place your order. Please try again.');
      return;
    }
    setJustPlacedId((data as Order).id);
    clearCart();
    setCartOpen(false);
    setDeliveryAddress('');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Hero */}
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 px-6 py-8 text-white shadow-card sm:px-10 sm:py-10">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-brand-100">
            Hungry? We&apos;ve got you
          </p>
          <h1 className="max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">
            Order from Bolt Kitchen and track it live, all the way to your door.
          </h1>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes…"
                className="w-full rounded-xl border-0 bg-white/95 py-2.5 pl-9 pr-3 text-sm text-stone-800 shadow-soft placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="btn relative bg-white text-brand-700 hover:bg-brand-50"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Menu */}
        <div>
          {/* Category filter */}
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`chip ring-1 ${
                    active
                      ? 'bg-brand-500 text-white ring-brand-500'
                      : 'bg-white text-stone-600 ring-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 text-stone-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading menu…
            </div>
          )}
          {error && (
            <div className="card px-5 py-8 text-center text-sm text-red-600">
              Couldn&apos;t load the menu: {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => {
                const inCart = cart[item.id]?.quantity ?? 0;
                return (
                  <article
                    key={item.id}
                    className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-ring"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 badge bg-white/90 text-stone-700 ring-1 ring-stone-200 backdrop-blur">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-stone-900">{item.name}</h3>
                        <span className="text-base font-extrabold text-brand-600">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-stone-500">{item.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        {inCart > 0 ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decrement(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-700 transition hover:bg-stone-200 active:scale-95"
                              aria-label={`Remove one ${item.name}`}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-stone-900">
                              {inCart}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white transition hover:bg-brand-600 active:scale-95"
                              aria-label={`Add one more ${item.name}`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="btn-subtle"
                          >
                            <Plus className="h-4 w-4" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full card px-6 py-12 text-center text-stone-400">
                  No dishes match your search.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live order tracker */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-stone-900">Your Orders</h2>
                <p className="text-xs text-stone-400">Live status updates as they happen</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <ShoppingCart className="h-4.5 w-4.5" />
              </span>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
              {myOrders.length === 0 && (
                <div className="px-2 py-10 text-center text-sm text-stone-400">
                  No orders yet. Add items to your cart and place an order to see live tracking here.
                </div>
              )}
              {myOrders.map((order) => {
                const isJustPlaced = justPlacedId === order.id;
                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl ring-1 transition-all ${
                      isJustPlaced
                        ? 'bg-brand-50/60 ring-brand-200 animate-pop'
                        : 'bg-white ring-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between px-4 pt-3.5">
                      <p className="text-sm font-bold text-stone-900">{order.customer_name}</p>
                      <span className={`badge ring-1 ${statusColor(order.status)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot(order.status)}`} />
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <div className="px-4 pb-3 pt-3">
                      <OrderTracker status={order.status} />
                      {order.status === 'delivered' && (
                        <FeedbackCard orderId={order.id} />
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-dashed border-stone-200 px-4 py-2.5">
                      <span className="text-xs text-stone-400">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                      <span className="text-sm font-bold text-stone-900">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <h2 className="text-base font-bold text-stone-900">Your Cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cartList.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-stone-400">
                  <ShoppingCart className="mb-3 h-10 w-10 text-stone-300" />
                  <p className="text-sm font-medium">Your cart is empty.</p>
                  <p className="text-xs">Add some delicious dishes to get started.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {cartList.map((entry) => (
                    <li
                      key={entry.item.id}
                      className="flex items-center gap-3 rounded-xl bg-stone-50 p-3"
                    >
                      <img
                        src={entry.item.image_url}
                        alt={entry.item.name}
                        className="h-14 w-14 flex-none rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-stone-900">
                          {entry.item.name}
                        </p>
                        <p className="text-xs text-stone-400">{formatPrice(entry.item.price)} each</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            onClick={() => decrement(entry.item.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100"
                            aria-label={`Remove one ${entry.item.name}`}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-sm font-bold">{entry.quantity}</span>
                          <button
                            onClick={() => addToCart(entry.item)}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500 text-white hover:bg-brand-600"
                            aria-label={`Add one more ${entry.item.name}`}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(entry.item.id)}
                            className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-stone-400 hover:bg-red-50 hover:text-red-500"
                            aria-label={`Remove ${entry.item.name} from cart`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-stone-900">
                        {formatPrice(entry.item.price * entry.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cartList.length > 0 && (
              <div className="space-y-4 border-t border-stone-100 p-5">
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Your name
                    </label>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Delivery address
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Street, apartment, city"
                        rows={2}
                        className="w-full rounded-xl border border-stone-200 py-2.5 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                  <span className="text-sm font-semibold text-stone-500">Total</span>
                  <span className="text-lg font-extrabold text-stone-900">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                {placeError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    {placeError}
                  </p>
                )}

                <button
                  onClick={placeOrder}
                  disabled={
                    placing ||
                    !customerName.trim() ||
                    !deliveryAddress.trim() ||
                    cartList.length === 0
                  }
                  className="btn-primary w-full"
                >
                  {placing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Placing order…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Place Order · {formatPrice(cartTotal)}
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-stone-400">
                  Pickup from {PICKUP_LOCATION}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
