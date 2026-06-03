import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Saving } from '../types/database';

export function useSavings(userId: string | undefined) {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavings = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('savings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) setSavings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSavings();
  }, [userId]);

  const addSaving = async (goal_name: string, target_amount: number, icon?: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('savings')
      .insert([{ user_id: userId, goal_name, target_amount, current_amount: 0, icon }])
      .select()
      .single();

    if (!error && data) {
      setSavings([data, ...savings]);
    }
    return { data, error };
  };

  const updateAmount = async (id: string, newAmount: number) => {
    const { error } = await supabase
      .from('savings')
      .update({ current_amount: newAmount })
      .eq('id', id);

    if (!error) {
      setSavings(savings.map(s => s.id === id ? { ...s, current_amount: newAmount } : s));
    }
  };

  const deleteSaving = async (id: string) => {
    const { error } = await supabase.from('savings').delete().eq('id', id);
    if (!error) {
      setSavings(savings.filter(s => s.id !== id));
    }
  };

  return { savings, loading, addSaving, updateAmount, deleteSaving, refresh: fetchSavings };
}
