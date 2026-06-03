import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Habit } from '../types/database';

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) setHabits(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHabits();
  }, [userId]);

  const addHabit = async (name: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('habits')
      .insert([{ name, user_id: userId, streak: 0, completed: false }])
      .select()
      .single();

    if (!error && data) {
      setHabits([data, ...habits]);
    }
    return { data, error };
  };

  const toggleHabit = async (habitId: string, currentStatus: boolean) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const newStatus = !currentStatus;
    const newStreak = newStatus ? habit.streak + 1 : Math.max(0, habit.streak - 1);

    const { error } = await supabase
      .from('habits')
      .update({ 
        completed: newStatus, 
        streak: newStreak,
        last_completed_at: newStatus ? new Date().toISOString() : habit.last_completed_at 
      })
      .eq('id', habitId);

    if (!error) {
      setHabits(habits.map(h => 
        h.id === habitId ? { ...h, completed: newStatus, streak: newStreak } : h
      ));
    }
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (!error) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  return { habits, loading, addHabit, toggleHabit, deleteHabit, refresh: fetchHabits };
}
