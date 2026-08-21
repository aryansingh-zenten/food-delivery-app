import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { MenuItem } from '@/types';

type MenuState = {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
};

export function useMenu(): MenuState {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setItems((data ?? []) as MenuItem[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return { items, loading, error };
}
