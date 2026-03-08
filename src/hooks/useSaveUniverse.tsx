import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SavedUniverse {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  galaxies: SavedGalaxy[];
}

interface SavedGalaxy {
  id: string;
  name: string;
  galaxy_type: string | null;
  planets: SavedPlanet[];
}

interface SavedPlanet {
  id: string;
  name: string;
  planet_type: string | null;
  continents: SavedContinent[];
}

interface SavedContinent {
  id: string;
  name: string;
  climate: string | null;
  nations: SavedNation[];
}

interface SavedNation {
  id: string;
  name: string;
  government_type: string | null;
  races: SavedRace[];
  families: SavedFamily[];
}

interface SavedRace {
  id: string;
  name: string;
  physical_traits: string | null;
}

interface SavedFamily {
  id: string;
  name: string;
  rank: string | null;
  motto: string | null;
}

export type { SavedUniverse, SavedGalaxy, SavedPlanet, SavedContinent, SavedNation, SavedRace, SavedFamily };

export function useSaveUniverse() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedUniverses, setSavedUniverses] = useState<SavedUniverse[]>([]);

  const saveSingleElement = useCallback(async (type: string, data: Record<string, unknown>, parentId?: string) => {
    if (!user) return null;
    setIsSaving(true);

    try {
      switch (type) {
        case 'universe': {
          const { data: row, error } = await supabase.from('universes').insert({
            user_id: user.id,
            name: (data.name as string) || 'Sans nom',
            description: typeof data.description === 'string' ? data.description : JSON.stringify(data.description),
            origin_story: typeof data.origin_story === 'string' ? data.origin_story : JSON.stringify(data.origin_story),
            magic_system: typeof data.magic_system === 'string' ? data.magic_system : JSON.stringify(data.magic_system),
            laws_of_physics: typeof data.laws_of_physics === 'string' ? data.laws_of_physics : JSON.stringify(data.laws_of_physics),
          }).select('id').single();
          if (error) throw error;
          return row?.id;
        }
        case 'galaxy': {
          if (!parentId) throw new Error('galaxy needs universe_id');
          const { data: row, error } = await supabase.from('galaxies').insert({
            universe_id: parentId,
            name: (data.name as string) || 'Sans nom',
            galaxy_type: str(data.galaxy_type),
            star_count: str(data.star_count),
            diameter_light_years: num(data.diameter_light_years),
            origin_story: str(data.origin_story),
            special_features: str(data.special_features),
          }).select('id').single();
          if (error) throw error;
          return row?.id;
        }
        case 'planet': {
          if (!parentId) throw new Error('planet needs galaxy_id');
          const { data: row, error } = await supabase.from('planets').insert({
            galaxy_id: parentId,
            name: (data.name as string) || 'Sans nom',
            planet_type: str(data.planet_type),
            diameter_km: num(data.diameter_km),
            surface_area_km2: num(data.surface_area_km2),
            gravity_g: num(data.gravity_g),
            day_cycle_hours: num(data.day_cycle_hours),
            year_days: num(data.year_days),
            land_percentage: num(data.land_percentage),
            ocean_percentage: num(data.ocean_percentage),
            climate: typeof data.climate === 'string' ? data.climate : JSON.stringify(data.climate),
            special_features: str(data.special_features),
          }).select('id').single();
          if (error) throw error;
          return row?.id;
        }
        case 'continent': {
          if (!parentId) throw new Error('continent needs planet_id');
          const { data: row, error } = await supabase.from('continents').insert({
            planet_id: parentId,
            name: (data.name as string) || 'Sans nom',
            surface_area_km2: num(data.surface_area_km2),
            percentage_of_land: num(data.percentage_of_land),
            climate: typeof data.climate === 'string' ? data.climate : JSON.stringify(data.climate),
            terrain_type: str(data.terrain_type),
            characteristics: str(data.characteristics),
          }).select('id').single();
          if (error) throw error;
          return row?.id;
        }
        case 'nation': {
          if (!parentId) throw new Error('nation needs continent_id');
          const { data: row, error } = await supabase.from('nations').insert({
            continent_id: parentId,
            name: (data.name as string) || 'Sans nom',
            government_type: str(data.government_type),
            population: str(data.population),
            capital_city: typeof data.capital_city === 'string' ? data.capital_city : (data.capital_city as any)?.name || str(data.capital_city),
            capital_population: typeof data.capital_city === 'object' ? (data.capital_city as any)?.population : str(data.capital_population),
            culture: typeof data.culture === 'string' ? data.culture : JSON.stringify(data.culture),
            religion: typeof data.religion === 'string' ? data.religion : JSON.stringify(data.religion),
            economy: typeof data.economy === 'string' ? data.economy : JSON.stringify(data.economy),
            military: typeof data.military === 'string' ? data.military : JSON.stringify(data.military),
            history: str(data.history),
            special_features: str(data.special_features),
            surface_area_km2: num(data.surface_area_km2),
          }).select('id').single();
          if (error) throw error;
          return row?.id;
        }
        case 'race': {
          const { data: row, error } = await supabase.from('races').insert({
            nation_id: parentId || null,
            name: (data.name as string) || 'Sans nom',
            physical_traits: typeof data.physical_traits === 'string' ? data.physical_traits : JSON.stringify(data.physical_traits),
            lifespan: str(data.lifespan),
            magic_ability: typeof data.magic_ability === 'string' ? data.magic_ability : JSON.stringify(data.magic_ability),
            culture: typeof data.culture === 'string' ? data.culture : JSON.stringify(data.culture),
            society_structure: str(data.society_structure),
            strengths: str(data.strengths),
            weaknesses: str(data.weaknesses),
            history: str(data.history),
          }).select('id').single();
          if (error) throw error;
          return row?.id;
        }
        case 'family': {
          if (!parentId) throw new Error('family needs nation_id');
          const { data: row, error } = await supabase.from('families').insert({
            nation_id: parentId,
            name: (data.name as string) || 'Sans nom',
            rank: str(data.rank),
            motto: str(data.motto),
            coat_of_arms: typeof data.coat_of_arms === 'string' ? data.coat_of_arms : JSON.stringify(data.coat_of_arms),
            history: str(data.history),
            wealth_level: typeof data.wealth === 'object' ? (data.wealth as any)?.level : str(data.wealth_level),
            political_power: typeof data.political_power === 'object' ? JSON.stringify(data.political_power) : str(data.political_power),
            lands_controlled: typeof data.lands_controlled === 'object' ? JSON.stringify(data.lands_controlled) : str(data.lands_controlled),
            notable_members: data.notable_members ? data.notable_members : null,
            alliances: typeof data.alliances === 'object' ? JSON.stringify(data.alliances) : str(data.alliances),
            rivals: typeof data.rivals === 'object' ? JSON.stringify(data.rivals) : str(data.rivals),
          }).select('id').single();
          if (error) throw error;
          return row?.id;
        }
      }
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  const saveMassGeneration = useCallback(async (data: Record<string, unknown>) => {
    if (!user) {
      toast.error('Connectez-vous pour sauvegarder');
      return;
    }
    setIsSaving(true);

    try {
      const universes = (data.universes as Record<string, unknown>[]) || [];
      let savedCount = 0;

      for (const universe of universes) {
        const universeId = await saveSingleElement('universe', universe);
        if (!universeId) continue;
        savedCount++;

        const galaxies = (universe.galaxies as Record<string, unknown>[]) || [];
        for (const galaxy of galaxies) {
          const galaxyId = await saveSingleElement('galaxy', galaxy, universeId);
          if (!galaxyId) continue;
          savedCount++;

          const planets = (galaxy.planets as Record<string, unknown>[]) || [];
          for (const planet of planets) {
            const planetId = await saveSingleElement('planet', planet, galaxyId);
            if (!planetId) continue;
            savedCount++;

            const continents = (planet.continents as Record<string, unknown>[]) || [];
            for (const continent of continents) {
              const continentId = await saveSingleElement('continent', continent, planetId);
              if (!continentId) continue;
              savedCount++;

              const nations = (continent.nations as Record<string, unknown>[]) || [];
              for (const nation of nations) {
                const nationId = await saveSingleElement('nation', nation, continentId);
                if (!nationId) continue;
                savedCount++;

                const races = (nation.races as Record<string, unknown>[]) || [];
                for (const race of races) {
                  await saveSingleElement('race', race, nationId);
                  savedCount++;
                }

                const families = (nation.families as Record<string, unknown>[]) || [];
                for (const family of families) {
                  await saveSingleElement('family', family, nationId);
                  savedCount++;
                }
              }
            }
          }
        }
      }

      toast.success(`${savedCount} éléments sauvegardés en base de données !`);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Erreur lors de la sauvegarde : ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setIsSaving(false);
    }
  }, [user, saveSingleElement]);

  const loadUniverses = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Load universes
      const { data: univs, error: uErr } = await supabase
        .from('universes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (uErr) throw uErr;
      if (!univs?.length) { setSavedUniverses([]); return; }

      const result: SavedUniverse[] = [];

      for (const u of univs) {
        const { data: galaxies } = await supabase.from('galaxies').select('*').eq('universe_id', u.id);

        const loadedGalaxies: SavedGalaxy[] = [];
        for (const g of galaxies || []) {
          const { data: planets } = await supabase.from('planets').select('*').eq('galaxy_id', g.id);

          const loadedPlanets: SavedPlanet[] = [];
          for (const p of planets || []) {
            const { data: continents } = await supabase.from('continents').select('*').eq('planet_id', p.id);

            const loadedContinents: SavedContinent[] = [];
            for (const c of continents || []) {
              const { data: nations } = await supabase.from('nations').select('*').eq('continent_id', c.id);

              const loadedNations: SavedNation[] = [];
              for (const n of nations || []) {
                const { data: races } = await supabase.from('races').select('*').eq('nation_id', n.id);
                const { data: families } = await supabase.from('families').select('*').eq('nation_id', n.id);

                loadedNations.push({
                  id: n.id,
                  name: n.name,
                  government_type: n.government_type,
                  races: (races || []).map(r => ({ id: r.id, name: r.name, physical_traits: r.physical_traits })),
                  families: (families || []).map(f => ({ id: f.id, name: f.name, rank: f.rank, motto: f.motto })),
                });
              }

              loadedContinents.push({
                id: c.id,
                name: c.name,
                climate: c.climate,
                nations: loadedNations,
              });
            }

            loadedPlanets.push({
              id: p.id,
              name: p.name,
              planet_type: p.planet_type,
              continents: loadedContinents,
            });
          }

          loadedGalaxies.push({
            id: g.id,
            name: g.name,
            galaxy_type: g.galaxy_type,
            planets: loadedPlanets,
          });
        }

        result.push({
          id: u.id,
          name: u.name,
          description: u.description,
          created_at: u.created_at,
          galaxies: loadedGalaxies,
        });
      }

      setSavedUniverses(result);
    } catch (err) {
      console.error('Load error:', err);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteUniverse = useCallback(async (universeId: string) => {
    if (!user) return;

    try {
      // Delete in reverse order due to foreign keys
      const { data: galaxies } = await supabase.from('galaxies').select('id').eq('universe_id', universeId);
      for (const g of galaxies || []) {
        const { data: planets } = await supabase.from('planets').select('id').eq('galaxy_id', g.id);
        for (const p of planets || []) {
          const { data: continents } = await supabase.from('continents').select('id').eq('planet_id', p.id);
          for (const c of continents || []) {
            const { data: nations } = await supabase.from('nations').select('id').eq('continent_id', c.id);
            for (const n of nations || []) {
              await supabase.from('families').delete().eq('nation_id', n.id);
              await supabase.from('races').delete().eq('nation_id', n.id);
            }
            await supabase.from('nations').delete().eq('continent_id', c.id);
          }
          await supabase.from('continents').delete().eq('planet_id', p.id);
        }
        await supabase.from('planets').delete().eq('galaxy_id', g.id);
      }
      await supabase.from('galaxies').delete().eq('universe_id', universeId);
      await supabase.from('universes').delete().eq('id', universeId);

      setSavedUniverses(prev => prev.filter(u => u.id !== universeId));
      toast.success('Univers supprimé');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Erreur lors de la suppression');
    }
  }, [user]);

  return {
    isSaving,
    isLoading,
    savedUniverses,
    saveSingleElement,
    saveMassGeneration,
    loadUniverses,
    deleteUniverse,
  };
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}
