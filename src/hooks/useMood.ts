import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MoodLog } from '../types/database';

export function useMood(userId: string | undefined) {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  const addMood = async (emoji: string, label: string, note?: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('mood_logs')
      .insert([{ user_id: userId, emoji, label, note }])
      .select()
      .single();

    if (!error && data) {
      setLogs([data, ...logs]);
    }
    return { data, error };
  };

  return { logs, loading, addMood, refresh: fetchLogs };
}
