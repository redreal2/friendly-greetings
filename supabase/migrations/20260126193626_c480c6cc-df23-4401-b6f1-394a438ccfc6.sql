-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create universes table (top level)
CREATE TABLE public.universes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  origin_story TEXT,
  magic_system TEXT,
  laws_of_physics TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.universes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own universes" ON public.universes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create universes" ON public.universes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own universes" ON public.universes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own universes" ON public.universes FOR DELETE USING (auth.uid() = user_id);

-- Create galaxies table
CREATE TABLE public.galaxies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  galaxy_type TEXT,
  origin_story TEXT,
  diameter_light_years NUMERIC,
  star_count TEXT,
  special_features TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.galaxies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own galaxies" ON public.galaxies FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.universes WHERE universes.id = galaxies.universe_id AND universes.user_id = auth.uid())
);
CREATE POLICY "Users can create galaxies" ON public.galaxies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.universes WHERE universes.id = galaxies.universe_id AND universes.user_id = auth.uid())
);
CREATE POLICY "Users can update own galaxies" ON public.galaxies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.universes WHERE universes.id = galaxies.universe_id AND universes.user_id = auth.uid())
);
CREATE POLICY "Users can delete own galaxies" ON public.galaxies FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.universes WHERE universes.id = galaxies.universe_id AND universes.user_id = auth.uid())
);

-- Create planets table
CREATE TABLE public.planets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  galaxy_id UUID NOT NULL REFERENCES public.galaxies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  planet_type TEXT,
  diameter_km NUMERIC,
  surface_area_km2 NUMERIC,
  land_percentage NUMERIC,
  ocean_percentage NUMERIC,
  gravity_g NUMERIC,
  day_cycle_hours NUMERIC,
  year_days NUMERIC,
  climate TEXT,
  special_features TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.planets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own planets" ON public.planets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.galaxies g 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE g.id = planets.galaxy_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create planets" ON public.planets FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.galaxies g 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE g.id = planets.galaxy_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own planets" ON public.planets FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.galaxies g 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE g.id = planets.galaxy_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete own planets" ON public.planets FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.galaxies g 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE g.id = planets.galaxy_id AND u.user_id = auth.uid()
  )
);

-- Create continents table
CREATE TABLE public.continents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planet_id UUID NOT NULL REFERENCES public.planets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  surface_area_km2 NUMERIC,
  percentage_of_land NUMERIC,
  climate TEXT,
  terrain_type TEXT,
  characteristics TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.continents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own continents" ON public.continents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.planets p 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE p.id = continents.planet_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create continents" ON public.continents FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.planets p 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE p.id = continents.planet_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own continents" ON public.continents FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.planets p 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE p.id = continents.planet_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete own continents" ON public.continents FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.planets p 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE p.id = continents.planet_id AND u.user_id = auth.uid()
  )
);

-- Create nations table
CREATE TABLE public.nations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  continent_id UUID NOT NULL REFERENCES public.continents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  government_type TEXT,
  population TEXT,
  surface_area_km2 NUMERIC,
  capital_city TEXT,
  capital_population TEXT,
  culture TEXT,
  religion TEXT,
  economy TEXT,
  military TEXT,
  history TEXT,
  special_features TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own nations" ON public.nations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.continents c 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE c.id = nations.continent_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create nations" ON public.nations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.continents c 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE c.id = nations.continent_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own nations" ON public.nations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.continents c 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE c.id = nations.continent_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete own nations" ON public.nations FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.continents c 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE c.id = nations.continent_id AND u.user_id = auth.uid()
  )
);

-- Create races table
CREATE TABLE public.races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nation_id UUID REFERENCES public.nations(id) ON DELETE CASCADE,
  planet_id UUID REFERENCES public.planets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  physical_traits TEXT,
  lifespan TEXT,
  magic_ability TEXT,
  culture TEXT,
  society_structure TEXT,
  strengths TEXT,
  weaknesses TEXT,
  history TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own races" ON public.races FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.planets p 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE p.id = races.planet_id AND u.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.nations n 
    JOIN public.continents c ON n.continent_id = c.id 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE n.id = races.nation_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create races" ON public.races FOR INSERT WITH CHECK (
  (planet_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.planets p 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE p.id = races.planet_id AND u.user_id = auth.uid()
  )) OR (nation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.nations n 
    JOIN public.continents c ON n.continent_id = c.id 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE n.id = races.nation_id AND u.user_id = auth.uid()
  ))
);
CREATE POLICY "Users can update own races" ON public.races FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.planets p 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE p.id = races.planet_id AND u.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.nations n 
    JOIN public.continents c ON n.continent_id = c.id 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE n.id = races.nation_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete own races" ON public.races FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.planets p 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE p.id = races.planet_id AND u.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.nations n 
    JOIN public.continents c ON n.continent_id = c.id 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE n.id = races.nation_id AND u.user_id = auth.uid()
  )
);

-- Create families table (noble houses, dynasties, etc.)
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nation_id UUID NOT NULL REFERENCES public.nations(id) ON DELETE CASCADE,
  race_id UUID REFERENCES public.races(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  rank TEXT,
  coat_of_arms TEXT,
  motto TEXT,
  history TEXT,
  wealth_level TEXT,
  political_power TEXT,
  lands_controlled TEXT,
  notable_members JSONB,
  alliances TEXT,
  rivals TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own families" ON public.families FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.nations n 
    JOIN public.continents c ON n.continent_id = c.id 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE n.id = families.nation_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create families" ON public.families FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.nations n 
    JOIN public.continents c ON n.continent_id = c.id 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE n.id = families.nation_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own families" ON public.families FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.nations n 
    JOIN public.continents c ON n.continent_id = c.id 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE n.id = families.nation_id AND u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete own families" ON public.families FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.nations n 
    JOIN public.continents c ON n.continent_id = c.id 
    JOIN public.planets p ON c.planet_id = p.id 
    JOIN public.galaxies g ON p.galaxy_id = g.id 
    JOIN public.universes u ON g.universe_id = u.id 
    WHERE n.id = families.nation_id AND u.user_id = auth.uid()
  )
);

-- Create generation_sessions table (to track AI generation history)
CREATE TABLE public.generation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  result_type TEXT NOT NULL,
  result_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.generation_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create sessions" ON public.generation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_universes_updated_at BEFORE UPDATE ON public.universes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();