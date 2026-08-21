import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types';

type OrdersState = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  refresh: () => Promise<void>;
};

export function useOrders(): OrdersState {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setOrders((data ?? []) as Order[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => {
              const next = [payload.new as Order, ...prev];
              return next.sort(
                (a, b) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
              );
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o)),
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as Order;
            setOrders((prev) => prev.filter((o) => o.id !== deleted.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }, []);

  return {
    orders,
    loading,
    error,
    updateStatus,
    refresh: fetchOrders,
  };
}
