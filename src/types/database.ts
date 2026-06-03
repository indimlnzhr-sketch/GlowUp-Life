export type Habit = {
  id: string;
  user_id: string;
  name: string;
  streak: number;
  completed: boolean;
  last_completed_at: string | null;
  created_at: string;
};

export type MoodLog = {
  id: string;
  user_id: string;
  emoji: string;
  label: string;
  note?: string;
  created_at: string;
};

export type Saving = {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  icon?: string;
  created_at: string;
};

export type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relation: string;
  created_at: string;
};

export type GameScore = {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  high_score: number;
  created_at: string;
};

export type Reminder = {
  id: string;
  user_id: string;
  type: 'sleep' | 'water' | 'study' | 'custom';
  title: string;
  time?: string;
  target_value?: number;
  current_value: number;
  is_active: boolean;
  days?: number[];
  created_at: string;
};

export type AIChat = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  saving_goal_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  note?: string;
  created_at: string;
};
