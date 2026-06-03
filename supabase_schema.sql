-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    streak INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Mood Logs Table
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    emoji TEXT NOT NULL,
    label TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Savings Table
CREATE TABLE IF NOT EXISTS public.savings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    goal_name TEXT NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Emergency Contacts Table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Game Scores Table
CREATE TABLE IF NOT EXISTS public.game_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    game_id TEXT NOT NULL, -- 'memory', 'mood_catcher', 'reflex'
    score INTEGER NOT NULL,
    high_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL, -- 'sleep', 'water', 'study', 'custom'
    title TEXT NOT NULL,
    time TEXT, -- HH:mm format
    target_value INTEGER, -- for water/sleep goals
    current_value INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    days JSONB, -- [0,1,2,3,4,5,6] for active days
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. AI Chats Table
CREATE TABLE IF NOT EXISTS public.ai_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Transactions Table (for Savings details)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    saving_goal_id UUID REFERENCES public.savings(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT NOT NULL, -- 'deposit', 'withdrawal'
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and add Policies
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own mood logs" ON public.mood_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own savings" ON public.savings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own emergency contacts" ON public.emergency_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own game scores" ON public.game_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own reminders" ON public.reminders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own chats" ON public.ai_chats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
