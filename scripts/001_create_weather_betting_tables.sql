-- Bảng profiles để lưu thông tin người dùng
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  balance INTEGER DEFAULT 1000,
  total_bets INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_login_date DATE,
  preferred_city TEXT DEFAULT 'hanoi',
  preferred_lat DOUBLE PRECISION,
  preferred_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng daily_rewards để theo dõi điểm danh hàng ngày
CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_date DATE NOT NULL,
  reward_amount INTEGER NOT NULL,
  streak_day INTEGER NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reward_date)
);

-- Bảng bets để lưu lịch sử cược
CREATE TABLE IF NOT EXISTS public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bet_type TEXT NOT NULL,
  bet_category TEXT NOT NULL,
  bet_description TEXT NOT NULL,
  city TEXT NOT NULL,
  amount INTEGER NOT NULL,
  odds DOUBLE PRECISION NOT NULL,
  potential_win INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  result TEXT,
  settled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies cho daily_rewards
CREATE POLICY "daily_rewards_select_own" ON public.daily_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_rewards_insert_own" ON public.daily_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies cho bets
CREATE POLICY "bets_select_own" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bets_insert_own" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bets_update_own" ON public.bets FOR UPDATE USING (auth.uid() = user_id);

-- Trigger tự động tạo profile khi user đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    1000
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Index để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON public.bets(status);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_date ON public.daily_rewards(user_id, reward_date);
