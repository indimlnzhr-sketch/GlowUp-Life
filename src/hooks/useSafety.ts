import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { EmergencyContact } from '../types/database';

export function useSafety(userId: string | undefined) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) setContacts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, [userId]);

  const addContact = async (name: string, phone: string, relation: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert([{ user_id: userId, name, phone, relation }])
      .select()
      .single();

    if (!error && data) {
      setContacts([data, ...contacts]);
    }
    return { data, error };
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
    if (!error) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  return { contacts, loading, addContact, deleteContact, refresh: fetchContacts };
}
