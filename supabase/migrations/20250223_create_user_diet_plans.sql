-- Create user_diet_plans table
CREATE TABLE IF NOT EXISTS public.user_diet_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    target_calories integer NOT NULL DEFAULT 2000,
    preferred_protein_category text NOT NULL DEFAULT 'Lean',
    daily_protein_target integer NOT NULL DEFAULT 100,
    daily_vegetable_servings integer NOT NULL DEFAULT 2,
    daily_fruit_servings integer NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_diet_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own diet plan"
    ON public.user_diet_plans
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own diet plan"
    ON public.user_diet_plans
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diet plan"
    ON public.user_diet_plans
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_diet_plans_updated_at
    BEFORE UPDATE ON public.user_diet_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
