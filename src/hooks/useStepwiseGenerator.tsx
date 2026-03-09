import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-universe`;

type StepType = 'universe' | 'galaxy' | 'planet' | 'continent' | 'nation' | 'race' | 'family';

const STEP_ORDER: StepType[] = ['universe', 'galaxy', 'planet', 'continent', 'nation', 'race', 'family'];

const STEP_LABELS: Record<StepType, string> = {
  universe: 'Univers',
  galaxy: 'Galaxies',
  planet: 'Planètes',
  continent: 'Continents',
  nation: 'Nations',
  race: 'Races',
  family: 'Familles',
};

interface StepScale {
  universes: number;
  galaxiesPerUniverse: number;
  planetsPerGalaxy: number;
  continentsPerPlanet: number;
  nationsPerContinent: number;
  racesPerNation: number;
  familiesPerNation: number;
}

interface StepProgress {
  currentStep: StepType;
  stepIndex: number;
  totalSteps: number;
  currentItem: number;
  totalItems: number;
  label: string;
  overallProgress: number;
}

interface GeneratedNode {
  type: StepType;
  data: Record<string, unknown>;
  dbId?: string;
  children: GeneratedNode[];
}

export function useStepwiseGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepProgress, setStepProgress] = useState<StepProgress | null>(null);
  const [streamedContent, setStreamedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatedTree, setGeneratedTree] = useState<GeneratedNode[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);

  const parseSSEResponse = async (response: Response): Promise<Record<string, unknown> | null> => {
    if (!response.body) return null;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullContent += content;
            setStreamedContent(fullContent);
          }
        } catch { /* partial line */ }
      }
    }

    // Parse final JSON
    try {
      const firstBrace = fullContent.indexOf('{');
      const lastBrace = fullContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        let jsonStr = fullContent.slice(firstBrace, lastBrace + 1);
        jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(jsonStr);
      }
    } catch (e) {
      console.error('Stepwise parse error:', e);
    }
    return null;
  };

  const generateStep = async (
    prompt: string,
    step: StepType,
    count: number,
    parentContext: Record<string, unknown> | null,
    signal: AbortSignal
  ): Promise<Record<string, unknown>[]> => {
    setStreamedContent('');
    const response = await fetch(GENERATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        type: step,
        mode: 'stepwise',
        scale: { count },
        context: parentContext,
      }),
      signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Erreur ${response.status}`);
    }

    const result = await parseSSEResponse(response);
    if (!result || !Array.isArray(result.items)) {
      throw new Error(`Parsing échoué pour l'étape ${step}`);
    }
    return result.items as Record<string, unknown>[];
  };

  const saveToDb = async (step: StepType, data: Record<string, unknown>, parentId?: string): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const tableMap: Record<StepType, string> = {
      universe: 'universes',
      galaxy: 'galaxies',
      planet: 'planets',
      continent: 'continents',
      nation: 'nations',
      race: 'races',
      family: 'families',
    };

    const fkMap: Record<StepType, string> = {
      universe: 'user_id',
      galaxy: 'universe_id',
      planet: 'galaxy_id',
      continent: 'planet_id',
      nation: 'continent_id',
      race: 'nation_id',
      family: 'nation_id',
    };

    const table = tableMap[step];
    const fkColumn = fkMap[step];
    const fkValue = step === 'universe' ? user.id : parentId;

    // Build insert record with known DB columns
    const record: Record<string, unknown> = { name: data.name || 'Sans nom', [fkColumn]: fkValue };

    if (step === 'universe') {
      record.description = data.description || null;
      record.origin_story = data.origin_story || null;
      record.laws_of_physics = data.laws_of_physics || null;
      record.magic_system = typeof data.magic_system === 'object' ? JSON.stringify(data.magic_system) : (data.magic_system || null);
    } else if (step === 'galaxy') {
      record.galaxy_type = data.galaxy_type || null;
      record.star_count = data.star_count || null;
      record.diameter_light_years = data.diameter_light_years || null;
      record.origin_story = data.origin_story || null;
      record.special_features = data.special_features || null;
    } else if (step === 'planet') {
      record.planet_type = data.planet_type || null;
      record.diameter_km = data.diameter_km || null;
      record.gravity_g = data.gravity_g || null;
      record.day_cycle_hours = data.day_cycle_hours || null;
      record.year_days = data.year_days || null;
      record.surface_area_km2 = data.surface_area_km2 || null;
      record.land_percentage = data.land_percentage || null;
      record.ocean_percentage = data.ocean_percentage || null;
      record.climate = typeof data.climate === 'object' ? JSON.stringify(data.climate) : (data.climate || null);
      record.special_features = data.special_features || null;
    } else if (step === 'continent') {
      record.surface_area_km2 = data.surface_area_km2 || null;
      record.percentage_of_land = data.percentage_of_land || null;
      record.terrain_type = data.terrain_type || null;
      record.climate = typeof data.climate === 'object' ? JSON.stringify(data.climate) : (data.climate || null);
      record.characteristics = data.characteristics || null;
    } else if (step === 'nation') {
      record.government_type = data.government_type || null;
      record.population = data.population || null;
      record.surface_area_km2 = data.surface_area_km2 || null;
      record.capital_city = typeof data.capital_city === 'object' ? (data.capital_city as any)?.name || JSON.stringify(data.capital_city) : (data.capital_city || null);
      record.capital_population = data.capital_population || null;
      record.culture = typeof data.culture === 'object' ? JSON.stringify(data.culture) : (data.culture || null);
      record.religion = typeof data.religion === 'object' ? JSON.stringify(data.religion) : (data.religion || null);
      record.economy = typeof data.economy === 'object' ? JSON.stringify(data.economy) : (data.economy || null);
      record.military = typeof data.military === 'object' ? JSON.stringify(data.military) : (data.military || null);
      record.history = data.history || null;
      record.special_features = data.special_features || null;
    } else if (step === 'race') {
      record.physical_traits = typeof data.physical_traits === 'object' ? JSON.stringify(data.physical_traits) : (data.physical_traits || null);
      record.lifespan = data.lifespan || null;
      record.magic_ability = typeof data.magic_ability === 'object' ? JSON.stringify(data.magic_ability) : (data.magic_ability || null);
      record.culture = typeof data.culture === 'object' ? JSON.stringify(data.culture) : (data.culture || null);
      record.society_structure = data.society_structure || null;
      record.strengths = data.strengths || null;
      record.weaknesses = data.weaknesses || null;
      record.history = data.history || null;
    } else if (step === 'family') {
      record.rank = data.rank || null;
      record.motto = data.motto || null;
      record.coat_of_arms = typeof data.coat_of_arms === 'object' ? JSON.stringify(data.coat_of_arms) : (data.coat_of_arms || null);
      record.history = data.history || null;
      record.wealth_level = data.wealth_level || null;
      record.political_power = data.political_power || null;
      record.lands_controlled = data.lands_controlled || null;
      record.alliances = data.alliances || null;
      record.rivals = data.rivals || null;
      record.notable_members = Array.isArray(data.notable_members) ? JSON.stringify(data.notable_members) : (data.notable_members || null);
    }

    const result = await supabase.from(table as any).insert(record as any).select('id').single();
    if (result.error) {
      console.error(`Save ${step} error:`, result.error);
      return null;
    }
    return (result.data as any)?.id || null;
  };

  const generate = useCallback(async (prompt: string, scale: StepScale) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedTree([]);
    cancelledRef.current = false;
    abortRef.current = new AbortController();

    const scaleByStep: Record<StepType, number> = {
      universe: scale.universes,
      galaxy: scale.galaxiesPerUniverse,
      planet: scale.planetsPerGalaxy,
      continent: scale.continentsPerPlanet,
      nation: scale.nationsPerContinent,
      race: scale.racesPerNation,
      family: scale.familiesPerNation,
    };

    // Count total generation calls
    let totalCalls = 0;
    let u = scale.universes;
    totalCalls += 1; // universes batch
    let g = u * scale.galaxiesPerUniverse;
    totalCalls += u; // galaxy batches
    let p = g * scale.planetsPerGalaxy;
    totalCalls += g;
    let co = p * scale.continentsPerPlanet;
    totalCalls += p;
    let n = co * scale.nationsPerContinent;
    totalCalls += co;
    if (scale.racesPerNation > 0) totalCalls += n;
    if (scale.familiesPerNation > 0) totalCalls += n;
    let completedCalls = 0;

    const updateProgress = (step: StepType, stepIdx: number, current: number, total: number) => {
      setStepProgress({
        currentStep: step,
        stepIndex: stepIdx,
        totalSteps: STEP_ORDER.length,
        currentItem: current,
        totalItems: total,
        label: `${STEP_LABELS[step]} (${current}/${total})`,
        overallProgress: Math.min(99, Math.round((completedCalls / totalCalls) * 100)),
      });
    };

    try {
      const tree: GeneratedNode[] = [];

      // Step 1: Universes
      updateProgress('universe', 0, 1, 1);
      const universes = await generateStep(prompt, 'universe', scaleByStep.universe, null, abortRef.current.signal);
      
      for (const uData of universes) {
        if (cancelledRef.current) throw new Error('Cancelled');
        const dbId = await saveToDb('universe', uData);
        const uNode: GeneratedNode = { type: 'universe', data: uData, dbId: dbId || undefined, children: [] };

        // Step 2: Galaxies for this universe
        completedCalls++;
        updateProgress('galaxy', 1, uNode.children.length + 1, scaleByStep.galaxy);
        const galaxies = await generateStep(prompt, 'galaxy', scaleByStep.galaxy, { universe: uData.name, description: uData.description }, abortRef.current.signal);

        for (const gData of galaxies) {
          if (cancelledRef.current) throw new Error('Cancelled');
          const gDbId = await saveToDb('galaxy', gData, dbId || undefined);
          const gNode: GeneratedNode = { type: 'galaxy', data: gData, dbId: gDbId || undefined, children: [] };

          // Step 3: Planets
          completedCalls++;
          updateProgress('planet', 2, gNode.children.length + 1, scaleByStep.planet);
          const planets = await generateStep(prompt, 'planet', scaleByStep.planet, { galaxy: gData.name, universe: uData.name }, abortRef.current.signal);

          for (const pData of planets) {
            if (cancelledRef.current) throw new Error('Cancelled');
            const pDbId = await saveToDb('planet', pData, gDbId || undefined);
            const pNode: GeneratedNode = { type: 'planet', data: pData, dbId: pDbId || undefined, children: [] };

            // Step 4: Continents
            completedCalls++;
            updateProgress('continent', 3, pNode.children.length + 1, scaleByStep.continent);
            const continents = await generateStep(prompt, 'continent', scaleByStep.continent, { planet: pData.name, climate: pData.climate }, abortRef.current.signal);

            for (const cData of continents) {
              if (cancelledRef.current) throw new Error('Cancelled');
              const cDbId = await saveToDb('continent', cData, pDbId || undefined);
              const cNode: GeneratedNode = { type: 'continent', data: cData, dbId: cDbId || undefined, children: [] };

              // Step 5: Nations
              completedCalls++;
              updateProgress('nation', 4, cNode.children.length + 1, scaleByStep.nation);
              const nations = await generateStep(prompt, 'nation', scaleByStep.nation, { continent: cData.name, planet: pData.name }, abortRef.current.signal);

              for (const nData of nations) {
                if (cancelledRef.current) throw new Error('Cancelled');
                const nDbId = await saveToDb('nation', nData, cDbId || undefined);
                const nNode: GeneratedNode = { type: 'nation', data: nData, dbId: nDbId || undefined, children: [] };

                // Step 6: Races
                if (scaleByStep.race > 0) {
                  completedCalls++;
                  updateProgress('race', 5, 1, scaleByStep.race);
                  const races = await generateStep(prompt, 'race', scaleByStep.race, { nation: nData.name, continent: cData.name }, abortRef.current.signal);
                  for (const rData of races) {
                    if (cancelledRef.current) throw new Error('Cancelled');
                    const rDbId = await saveToDb('race', rData, nDbId || undefined);
                    nNode.children.push({ type: 'race', data: rData, dbId: rDbId || undefined, children: [] });
                  }
                }

                // Step 7: Families
                if (scaleByStep.family > 0) {
                  completedCalls++;
                  updateProgress('family', 6, 1, scaleByStep.family);
                  const families = await generateStep(prompt, 'family', scaleByStep.family, { nation: nData.name, continent: cData.name }, abortRef.current.signal);
                  for (const fData of families) {
                    if (cancelledRef.current) throw new Error('Cancelled');
                    const fDbId = await saveToDb('family', fData, nDbId || undefined);
                    nNode.children.push({ type: 'family', data: fData, dbId: fDbId || undefined, children: [] });
                  }
                }

                cNode.children.push(nNode);
              }
              pNode.children.push(cNode);
            }
            gNode.children.push(pNode);
          }
          uNode.children.push(gNode);
        }
        tree.push(uNode);
        setGeneratedTree([...tree]);
      }

      setStepProgress(prev => prev ? { ...prev, overallProgress: 100 } : null);
      setIsGenerating(false);
      return tree;
    } catch (err) {
      if ((err as Error).message === 'Cancelled' || (err as Error).name === 'AbortError') {
        setError('Génération annulée');
      } else {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
      setIsGenerating(false);
      return null;
    }
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setStreamedContent('');
    setError(null);
    setStepProgress(null);
    setGeneratedTree([]);
  }, []);

  return {
    generate,
    cancel,
    reset,
    isGenerating,
    stepProgress,
    streamedContent,
    error,
    generatedTree,
    STEP_LABELS,
  };
}
