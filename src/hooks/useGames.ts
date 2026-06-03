import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GameScore } from '../types/database';

export function useGames(userId: string | undefined) {
  const [scores, setScores] = useState<GameScore[]>([]);

  const fetchScores = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .eq('user_id', userId);

    if (!error && data) setScores(data);
  };

  useEffect(() => {
    fetchScores();
  }, [userId]);

  const saveScore = async (gameId: string, score: number) => {
    if (!userId) return;
    
    // Check if score exists for this game
    const existing = scores.find(s => s.game_id === gameId);
    
    if (existing) {
      if (score > (existing.high_score || 0)) {
        const { error } = await supabase
          .from('game_scores')
          .update({ score, high_score: score })
          .eq('id', existing.id);
        
        if (!error) {
          setScores(scores.map(s => s.id === existing.id ? { ...s, score, high_score: score } : s));
        }
      } else {
        const { error } = await supabase
          .from('game_scores')
          .update({ score })
          .eq('id', existing.id);
        
        if (!error) {
          setScores(scores.map(s => s.id === existing.id ? { ...s, score } : s));
        }
      }
    } else {
      const { data, error } = await supabase
        .from('game_scores')
        .insert([{ user_id: userId, game_id: gameId, score, high_score: score }])
        .select()
        .single();
      
      if (!error && data) {
        setScores([...scores, data]);
      }
    }
  };

  return { scores, saveScore, refresh: fetchScores };
}
