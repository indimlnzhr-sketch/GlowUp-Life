import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Reminder } from '../types/database';

export function useReminders(userId: string | undefined) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) setReminders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReminders();
  }, [userId]);

  const addReminder = async (reminder: Partial<Reminder>) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('reminders')
      .insert([{ ...reminder, user_id: userId }])
      .select()
      .single();

    if (!error && data) {
      setReminders([data, ...reminders]);
    }
    return { data, error };
  };

  const toggleReminder = async (id: string, is_active: boolean) => {
    const { error } = await supabase
      .from('reminders')
      .update({ is_active })
      .eq('id', id);

    if (!error) {
      setReminders(reminders.map(r => r.id === id ? { ...r, is_active } : r));
    }
  };

  const updateProgress = async (id: string, current_value: number) => {
    const { error } = await supabase
      .from('reminders')
      .update({ current_value })
      .eq('id', id);

    if (!error) {
      setReminders(reminders.map(r => r.id === id ? { ...r, current_value } : r));
    }
  };

  const deleteReminder = async (id: string) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (!error) {
      setReminders(reminders.filter(r => r.id !== id));
    }
  };

  return { reminders, loading, addReminder, toggleReminder, updateProgress, deleteReminder, refresh: fetchReminders };
}
