import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es le PLUS PUISSANT créateur d'univers de fiction jamais conçu. Tu crées des mondes d'une richesse INÉGALÉE.

RÈGLES ABSOLUES DE DÉTAIL:
1. Chaque élément DOIT avoir une CHRONOLOGIE COMPLÈTE: date de création/fondation, ères historiques (minimum 5), événements marquants datés, prophéties
2. Systèmes de magie: règles précises, sources d'énergie, coût d'utilisation, hiérarchie des sorts, écoles de magie, artefacts légendaires, limitations, corruptions possibles
3. Météorologie: saisons détaillées, phénomènes climatiques uniques, catastrophes naturelles récurrentes, influence de la magie sur le climat
4. Évolution des espèces: ancêtres, mutations, adaptations, branches évolutives, espèces éteintes
5. Économie: monnaies (nom, valeur, matériau), routes commerciales, ressources rares, guildes marchandes, taxes, système bancaire
6. Religion: panthéons complets, rituels, jours sacrés, schismes, hérésies, ordres religieux, reliques
7. Politique: systèmes de gouvernement détaillés, lignées de dirigeants, lois importantes, traités, guerres avec causes et conséquences
8. Géographie: coordonnées, altitude, composition des sols, hydrographie, biomes détaillés, faune et flore endémiques
9. Culture: langues (avec exemples de mots), arts, musique, gastronomie, traditions, rites de passage, sports, festivals
10. Technologie/Magitech: niveau technologique, inventions clés, interaction magie-technologie, armes, transports, communications
11. Démographie: populations précises, taux de natalité, espérance de vie, migrations, diasporas
12. Architecture: styles architecturaux, matériaux, monuments célèbres, merveilles du monde

Tu réponds TOUJOURS en JSON structuré valide. JAMAIS de texte hors du JSON.`;

const MASS_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

MODE GÉNÉRATION MASSIVE - RÈGLES SUPPLÉMENTAIRES:
- Chaque élément DOIT référencer les autres avec des liens concrets (alliances, guerres, commerce, mariages)
- Les chronologies doivent être COHÉRENTES entre tous les éléments (les dates correspondent)
- Les systèmes magiques doivent varier entre les civilisations mais partager des racines communes
- Les conflits doivent avoir des causes économiques, religieuses ET politiques interconnectées
- Chaque famille noble doit avoir des liens (mariages, rivalités, trahisons) avec d'autres familles
- Les races doivent avoir des relations complexes (alliances anciennes, guerres oubliées, préjugés)
- L'économie de chaque nation doit dépendre des ressources des autres (interdépendance)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type, context, mode, scale } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (mode === "mass") {
      return await handleMassGeneration(prompt, scale, context, LOVABLE_API_KEY);
    }
    return await handleSingleGeneration(prompt, type, context, LOVABLE_API_KEY);
  } catch (e) {
    console.error("Generate universe error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getTypePrompt(type: string): string {
  const prompts: Record<string, string> = {
    universe: `Crée un univers/multivers ULTRA-DÉTAILLÉ. JSON:
{
  "name": string,
  "description": string (800+ mots, épique),
  "origin_story": string (500+ mots: Big Bang ou création divine, premiers instants, formation des premières étoiles),
  "age_billions_years": number,
  "dimensions_count": number,
  "magic_system": {
    "name": string,
    "source": string (d'où vient la magie),
    "rules": [string] (5+ règles fondamentales),
    "schools": [{"name": string, "specialty": string, "philosophy": string}],
    "forbidden_arts": [{"name": string, "why_forbidden": string, "consequences": string}],
    "energy_types": [{"name": string, "color": string, "properties": string}],
    "artifacts": [{"name": string, "power": string, "location": string, "history": string}]
  },
  "laws_of_physics": string (différences avec notre univers),
  "cosmology": {
    "structure": string (comment l'univers est organisé),
    "planes_of_existence": [{"name": string, "nature": string, "inhabitants": string}],
    "creation_myths": [{"culture": string, "myth": string}]
  },
  "chronology": {
    "eras": [{"name": string, "start_year": string, "end_year": string, "description": string, "key_events": [string]}]
  },
  "cosmic_phenomena": [{"name": string, "frequency": string, "effects": string}],
  "universal_languages": [{"name": string, "speakers": string, "sample_words": [{"word": string, "meaning": string}]}],
  "prophecies": [{"name": string, "content": string, "status": string}],
  "notable_events": [{"name": string, "date": string, "description": string, "consequences": string}]
}`,

    galaxy: `Crée une galaxie ULTRA-DÉTAILLÉE. JSON:
{
  "name": string,
  "galaxy_type": string,
  "diameter_light_years": number,
  "star_count": string,
  "age_billions_years": number,
  "habitable_systems": number,
  "origin_story": string (300+ mots),
  "special_features": string,
  "galactic_core": {"description": string, "phenomena": string, "dangers": string},
  "regions": [{"name": string, "description": string, "dominant_civilization": string, "resources": string, "dangers": string}],
  "trade_routes": [{"name": string, "connects": string, "goods": string, "dangers": string, "travel_time": string}],
  "galactic_government": {"type": string, "capital": string, "laws": [string], "enforcement": string},
  "chronology": {
    "eras": [{"name": string, "period": string, "description": string, "major_events": [string]}]
  },
  "galactic_wars": [{"name": string, "date": string, "belligerents": string, "cause": string, "outcome": string, "casualties": string}],
  "anomalies": [{"name": string, "location": string, "nature": string, "theories": string}],
  "extinct_civilizations": [{"name": string, "peak_era": string, "cause_of_extinction": string, "ruins": string, "legacy": string}]
}`,

    planet: `Crée une planète ULTRA-DÉTAILLÉE. JSON:
{
  "name": string,
  "planet_type": string,
  "diameter_km": number,
  "surface_area_km2": number,
  "land_percentage": number,
  "ocean_percentage": number,
  "gravity_g": number,
  "day_cycle_hours": number,
  "year_days": number,
  "moons": [{"name": string, "diameter_km": number, "orbital_period_days": number, "features": string, "mythology": string}],
  "atmosphere": {"composition": string, "breathable": boolean, "color_of_sky": string, "phenomena": string},
  "climate": {
    "zones": [{"name": string, "temperature_range": string, "precipitation": string, "seasons": string}],
    "unique_weather": [{"name": string, "description": string, "frequency": string, "danger_level": string}],
    "seasons": [{"name": string, "duration_days": number, "characteristics": string}]
  },
  "geology": {"tectonic_plates": number, "volcanic_activity": string, "mineral_resources": [{"name": string, "rarity": string, "uses": string}], "unique_formations": [string]},
  "biomes": [{"name": string, "area_percentage": number, "flora": [string], "fauna": [string], "unique_species": string}],
  "evolution_history": [{"era": string, "period": string, "key_developments": string, "dominant_species": string}],
  "population": string,
  "dominant_species": string,
  "history": string (400+ mots),
  "global_economy": {"currency": string, "major_exports": [string], "major_imports": [string]},
  "technology_level": string,
  "global_threats": [{"name": string, "nature": string, "severity": string}],
  "wonders": [{"name": string, "location": string, "description": string, "builder": string}]
}`,

    continent: `Crée un continent ULTRA-DÉTAILLÉ. JSON:
{
  "name": string,
  "surface_area_km2": number,
  "percentage_of_land": number,
  "terrain_type": string,
  "climate": {
    "general": string,
    "zones": [{"region": string, "type": string, "temperature": string, "rainfall": string}],
    "unique_phenomena": [{"name": string, "description": string, "season": string}],
    "natural_disasters": [{"type": string, "frequency": string, "affected_regions": string}]
  },
  "geography": {
    "mountain_ranges": [{"name": string, "highest_peak": string, "height_m": number, "mythology": string}],
    "rivers": [{"name": string, "length_km": number, "source": string, "mouth": string, "importance": string}],
    "forests": [{"name": string, "type": string, "area_km2": number, "unique_species": string, "dangers": string}],
    "deserts": [{"name": string, "type": string, "secrets": string}],
    "oceans_seas": [{"name": string, "depth_m": number, "creatures": string, "legends": string}]
  },
  "natural_resources": [{"name": string, "location": string, "abundance": string, "magical_properties": string}],
  "flora": [{"name": string, "type": string, "properties": string, "uses": string}],
  "fauna": [{"name": string, "type": string, "habitat": string, "behavior": string, "danger_level": string, "domesticable": boolean}],
  "magical_sites": [{"name": string, "type": string, "power": string, "guardian": string}],
  "chronology": [{"era": string, "period": string, "events": string}],
  "ancient_ruins": [{"name": string, "builder": string, "age": string, "current_state": string, "secrets": string}],
  "characteristics": string (300+ mots),
  "history": string (400+ mots),
  "legends": [{"name": string, "story": string, "truth_behind": string}]
}`,

    nation: `Crée une nation/empire ULTRA-DÉTAILLÉ. JSON:
{
  "name": string,
  "government_type": string,
  "ruler": {"name": string, "title": string, "age": number, "personality": string, "reign_since": string, "achievements": [string], "controversies": [string]},
  "population": string,
  "surface_area_km2": number,
  "capital_city": {"name": string, "population": string, "description": string, "landmarks": [string], "districts": [{"name": string, "character": string}]},
  "major_cities": [{"name": string, "population": string, "role": string, "speciality": string, "notable_feature": string}],
  "culture": {
    "values": [string],
    "traditions": [{"name": string, "description": string, "when": string}],
    "festivals": [{"name": string, "date": string, "description": string, "origin": string}],
    "cuisine": [{"dish": string, "ingredients": string, "occasion": string}],
    "arts": string,
    "music": string,
    "fashion": string,
    "language": {"name": string, "family": string, "sample_phrases": [{"phrase": string, "meaning": string}]},
    "rites_of_passage": [{"name": string, "age": string, "description": string}]
  },
  "religion": {
    "main_faith": string,
    "pantheon": [{"deity": string, "domain": string, "symbol": string}],
    "temples": [{"name": string, "location": string, "importance": string}],
    "religious_orders": [{"name": string, "purpose": string, "power": string}],
    "heresies": [{"name": string, "beliefs": string, "status": string}],
    "sacred_days": [{"name": string, "date": string, "rituals": string}]
  },
  "economy": {
    "currency": {"name": string, "material": string, "denominations": [string]},
    "main_industries": [string],
    "trade_partners": [{"nation": string, "goods_exchanged": string}],
    "guilds": [{"name": string, "trade": string, "power_level": string}],
    "taxes": string,
    "wealth_distribution": string
  },
  "military": {
    "total_forces": string,
    "army": {"size": string, "elite_units": [{"name": string, "specialty": string, "reputation": string}]},
    "navy": string,
    "special_forces": [{"name": string, "role": string}],
    "fortifications": [{"name": string, "location": string, "strength": string}],
    "military_doctrine": string,
    "recent_wars": [{"name": string, "enemy": string, "outcome": string, "date": string}]
  },
  "magic_in_society": {
    "prevalence": string,
    "institutions": [{"name": string, "type": string, "reputation": string}],
    "laws_on_magic": [string],
    "notable_mages": [{"name": string, "specialty": string, "reputation": string}]
  },
  "technology_level": string,
  "social_classes": [{"name": string, "percentage": string, "rights": string, "lifestyle": string}],
  "laws": [{"name": string, "description": string, "punishment": string}],
  "history": string (500+ mots avec dates),
  "chronology": [{"year": string, "event": string, "significance": string}],
  "allies": string,
  "enemies": string,
  "current_conflicts": [{"name": string, "nature": string, "stakes": string}],
  "secrets": [{"name": string, "nature": string, "who_knows": string}],
  "special_features": string
}`,

    race: `Crée une race/espèce ULTRA-DÉTAILLÉE. JSON:
{
  "name": string,
  "physical_traits": {
    "appearance": string (détaillé),
    "average_height_cm": number,
    "average_weight_kg": number,
    "skin_colors": [string],
    "eye_colors": [string],
    "hair_types": [string],
    "distinguishing_features": [string],
    "sexual_dimorphism": string
  },
  "biology": {
    "lifespan": string,
    "maturity_age": number,
    "diet": string,
    "sleep_pattern": string,
    "reproduction": string,
    "senses": [{"sense": string, "compared_to_humans": string}],
    "resistances": [string],
    "vulnerabilities": [string]
  },
  "evolution": {
    "ancestors": string,
    "evolutionary_path": [{"era": string, "adaptation": string, "cause": string}],
    "sub_races": [{"name": string, "traits": string, "habitat": string, "population": string, "relations_with_main": string}],
    "extinct_variants": [{"name": string, "cause": string, "era": string}]
  },
  "population": string,
  "magic_ability": {
    "innate_powers": [{"name": string, "description": string, "rarity": string}],
    "magical_affinity": string,
    "limitations": string,
    "unique_magical_tradition": string
  },
  "intelligence_level": string,
  "psychology": {"temperament": string, "values": [string], "fears": [string], "motivations": [string]},
  "culture": {
    "social_structure": string,
    "family_model": string,
    "naming_conventions": string,
    "art_forms": [string],
    "music": string,
    "cuisine": [{"dish": string, "description": string}],
    "clothing": string,
    "architecture": string,
    "festivals": [{"name": string, "purpose": string, "description": string}],
    "rites_of_passage": [{"name": string, "age": string, "description": string}]
  },
  "language": {
    "name": string,
    "characteristics": string,
    "sample_vocabulary": [{"word": string, "meaning": string}],
    "writing_system": string
  },
  "religion": {
    "beliefs": string,
    "deities": [{"name": string, "domain": string}],
    "creation_myth": string,
    "afterlife_belief": string
  },
  "technology": {"level": string, "unique_inventions": [{"name": string, "description": string}]},
  "relations_with_others": [{"race": string, "relationship": string, "history": string}],
  "history": string (400+ mots),
  "chronology": [{"era": string, "event": string, "impact": string}],
  "famous_individuals": [{"name": string, "era": string, "achievement": string, "legacy": string}],
  "current_challenges": [{"challenge": string, "severity": string, "responses": string}],
  "strengths": string,
  "weaknesses": string
}`,

    family: `Crée une famille/lignée dynastique ULTRA-DÉTAILLÉE. JSON:
{
  "name": string,
  "rank": string,
  "coat_of_arms": {"description": string, "colors": [string], "symbols": [string], "meaning": string},
  "motto": string,
  "motto_origin": string,
  "founding": {"year": string, "founder": string, "circumstances": string, "legend": string},
  "bloodline_traits": {"physical": [string], "magical": [string], "psychological": [string], "curse_or_blessing": string},
  "history": string (500+ mots avec dates et événements),
  "chronology": [{"year": string, "event": string, "significance": string}],
  "wealth": {
    "level": string,
    "sources": [{"source": string, "percentage": string}],
    "total_estimated": string,
    "properties": [{"name": string, "type": string, "location": string, "description": string}],
    "treasures": [{"name": string, "nature": string, "value": string, "history": string}]
  },
  "political_power": {
    "influence_level": string,
    "positions_held": [{"position": string, "current_holder": string}],
    "political_strategy": string,
    "spy_network": string
  },
  "lands_controlled": [{"name": string, "type": string, "resources": string, "population": string}],
  "seat_of_power": {"name": string, "description": string, "defenses": string, "secrets": string},
  "notable_members": [
    {
      "name": string,
      "title": string,
      "birth_year": string,
      "death_year": string,
      "status": string,
      "personality": string,
      "appearance": string,
      "skills": [string],
      "achievements": [string],
      "relationships": [{"person": string, "nature": string}],
      "secrets": string,
      "legacy": string
    }
  ],
  "current_head": {"name": string, "age": number, "personality": string, "goals": [string], "fears": [string]},
  "succession": {"method": string, "current_heir": string, "disputes": string},
  "alliances": [{"family": string, "nature": string, "strength": string, "history": string}],
  "rivals": [{"family": string, "cause": string, "current_status": string, "notable_conflicts": string}],
  "secrets": [{"nature": string, "who_knows": string, "consequences_if_revealed": string}],
  "traditions": [{"name": string, "description": string, "origin": string}],
  "heirlooms": [{"name": string, "type": string, "power": string, "history": string, "current_holder": string}],
  "marriages": [{"member": string, "spouse": string, "spouse_family": string, "political_significance": string}],
  "scandals": [{"name": string, "era": string, "description": string, "consequences": string}]
}`,

    expand: `Enrichis et étends MASSIVEMENT les détails de cet élément. Ajoute:
- Chronologie complète avec dates
- Système magique détaillé
- Météo et phénomènes naturels
- Relations avec les éléments voisins
- Secrets et mystères
- Économie détaillée
- Culture approfondie (langue, cuisine, arts, musique)
- Personnages notables avec biographies
Triple la profondeur et les interconnexions.`,
  };
  return prompts[type] || prompts.expand;
}

async function handleSingleGeneration(prompt: string, type: string, context: any, apiKey: string) {
  const typeInstruction = getTypePrompt(type);
  let userMessage = `${typeInstruction}\n\nDemande: ${prompt}`;
  if (context) userMessage += `\n\nContexte parent: ${JSON.stringify(context)}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMessage }],
      stream: true,
    }),
  });

  if (!response.ok) return handleAIError(response);
  return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
}

async function handleMassGeneration(prompt: string, scale: any, context: any, apiKey: string) {
  const { universes = 1, galaxiesPerUniverse = 2, planetsPerGalaxy = 3, continentsPerPlanet = 2, nationsPerContinent = 2, racesPerNation = 1, familiesPerNation = 1 } = scale || {};

  const totalElements = universes + (universes * galaxiesPerUniverse) + (universes * galaxiesPerUniverse * planetsPerGalaxy) + (universes * galaxiesPerUniverse * planetsPerGalaxy * continentsPerPlanet) + (universes * galaxiesPerUniverse * planetsPerGalaxy * continentsPerPlanet * nationsPerContinent) + (universes * galaxiesPerUniverse * planetsPerGalaxy * continentsPerPlanet * nationsPerContinent * racesPerNation) + (universes * galaxiesPerUniverse * planetsPerGalaxy * continentsPerPlanet * nationsPerContinent * familiesPerNation);

  const massPrompt = `GÉNÉRATION MASSIVE D'UNIVERS - Crée TOUT d'un coup, ULTRA-DÉTAILLÉ et interconnecté.

Échelle: ${universes} univers, ${galaxiesPerUniverse} galaxies/univers, ${planetsPerGalaxy} planètes/galaxie, ${continentsPerPlanet} continents/planète, ${nationsPerContinent} nations/continent, ${racesPerNation} races/nation, ${familiesPerNation} familles/nation.
Total: ${totalElements} éléments.

Instructions: ${prompt}
${context ? `Contexte: ${JSON.stringify(context)}` : ''}

RÉPONDS avec ce JSON. CHAQUE élément doit être EXTRÊMEMENT détaillé:
{
  "total_elements": ${totalElements},
  "universes": [
    {
      "name": string,
      "description": string (200+ mots),
      "origin_story": string (200+ mots),
      "age_billions_years": number,
      "magic_system": {
        "name": string,
        "source": string,
        "rules": [string],
        "schools": [{"name": string, "specialty": string}],
        "forbidden_arts": [{"name": string, "consequences": string}],
        "energy_types": [{"name": string, "color": string, "properties": string}]
      },
      "cosmology": {"structure": string, "planes": [{"name": string, "nature": string}]},
      "chronology": [{"era": string, "period": string, "events": [string]}],
      "prophecies": [{"name": string, "content": string}],
      "galaxies": [
        {
          "name": string,
          "galaxy_type": string,
          "star_count": string,
          "diameter_light_years": number,
          "age_billions_years": number,
          "regions": [{"name": string, "description": string, "resources": string}],
          "trade_routes": [{"name": string, "connects": string, "goods": string}],
          "galactic_wars": [{"name": string, "date": string, "outcome": string}],
          "anomalies": [{"name": string, "nature": string}],
          "planets": [
            {
              "name": string,
              "planet_type": string,
              "diameter_km": number,
              "gravity_g": number,
              "population": string,
              "day_cycle_hours": number,
              "year_days": number,
              "moons": [{"name": string, "features": string}],
              "atmosphere": {"composition": string, "sky_color": string},
              "climate": {
                "zones": [{"name": string, "temperature": string}],
                "unique_weather": [{"name": string, "description": string, "danger_level": string}],
                "seasons": [{"name": string, "duration_days": number, "characteristics": string}]
              },
              "geology": {"resources": [{"name": string, "rarity": string, "magical_properties": string}]},
              "evolution_history": [{"era": string, "development": string}],
              "wonders": [{"name": string, "description": string}],
              "continents": [
                {
                  "name": string,
                  "surface_area_km2": number,
                  "climate": string,
                  "terrain_type": string,
                  "geography": {
                    "mountains": [{"name": string, "height_m": number}],
                    "rivers": [{"name": string, "length_km": number}],
                    "forests": [{"name": string, "type": string, "dangers": string}]
                  },
                  "natural_resources": [{"name": string, "magical_properties": string}],
                  "fauna": [{"name": string, "type": string, "danger_level": string}],
                  "flora": [{"name": string, "properties": string}],
                  "magical_sites": [{"name": string, "power": string}],
                  "ancient_ruins": [{"name": string, "builder": string, "secrets": string}],
                  "nations": [
                    {
                      "name": string,
                      "government_type": string,
                      "population": string,
                      "capital_city": {"name": string, "population": string, "landmarks": [string]},
                      "ruler": {"name": string, "title": string, "personality": string},
                      "culture": {
                        "values": [string],
                        "traditions": [{"name": string, "description": string}],
                        "festivals": [{"name": string, "date": string, "description": string}],
                        "cuisine": [{"dish": string, "description": string}],
                        "language": {"name": string, "sample_phrases": [{"phrase": string, "meaning": string}]}
                      },
                      "religion": {
                        "main_faith": string,
                        "pantheon": [{"deity": string, "domain": string, "symbol": string}],
                        "sacred_days": [{"name": string, "rituals": string}]
                      },
                      "economy": {
                        "currency": {"name": string, "material": string},
                        "main_industries": [string],
                        "guilds": [{"name": string, "trade": string}],
                        "trade_partners": [string]
                      },
                      "military": {
                        "total_forces": string,
                        "elite_units": [{"name": string, "specialty": string, "reputation": string}],
                        "fortifications": [{"name": string, "description": string}],
                        "recent_wars": [{"name": string, "outcome": string}]
                      },
                      "magic_in_society": {
                        "prevalence": string,
                        "institutions": [{"name": string, "type": string}],
                        "laws_on_magic": [string]
                      },
                      "social_classes": [{"name": string, "percentage": string, "rights": string}],
                      "chronology": [{"year": string, "event": string}],
                      "secrets": [{"nature": string, "who_knows": string}],
                      "races": [
                        {
                          "name": string,
                          "physical_traits": {"appearance": string, "height_cm": number, "distinguishing_features": [string]},
                          "lifespan": string,
                          "population": string,
                          "magic_ability": {"innate_powers": [string], "affinity": string},
                          "biology": {"diet": string, "senses": [string], "resistances": [string]},
                          "evolution": {"ancestors": string, "adaptations": [string]},
                          "culture": {"social_structure": string, "values": [string], "art_forms": [string]},
                          "language": {"name": string, "sample_words": [{"word": string, "meaning": string}]},
                          "religion": {"beliefs": string, "creation_myth": string},
                          "relations_with_others": [{"race": string, "relationship": string}],
                          "famous_individuals": [{"name": string, "achievement": string}],
                          "strengths": string,
                          "weaknesses": string
                        }
                      ],
                      "families": [
                        {
                          "name": string,
                          "rank": string,
                          "motto": string,
                          "coat_of_arms": {"description": string, "colors": [string], "symbols": [string]},
                          "founding": {"year": string, "founder": string, "circumstances": string},
                          "bloodline_traits": {"physical": [string], "magical": [string]},
                          "wealth": {"level": string, "sources": [string], "properties": [string]},
                          "political_power": {"influence_level": string, "positions_held": [string]},
                          "seat_of_power": {"name": string, "description": string},
                          "notable_members": [{"name": string, "title": string, "personality": string, "achievements": [string], "secrets": string}],
                          "current_head": {"name": string, "age": number, "goals": [string]},
                          "alliances": [{"family": string, "nature": string}],
                          "rivals": [{"family": string, "cause": string}],
                          "secrets": [{"nature": string, "consequences_if_revealed": string}],
                          "heirlooms": [{"name": string, "power": string, "history": string}],
                          "scandals": [{"name": string, "description": string}],
                          "traditions": [{"name": string, "description": string}],
                          "history": string (150+ mots)
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANT: Génère EXACTEMENT le nombre d'éléments demandés. Chaque élément ULTRA-DÉTAILLÉ avec chronologie, magie, météo, culture, économie, religion. Les noms doivent être UNIQUES et les descriptions RICHES. TOUTES les interconnexions entre éléments doivent être explicites.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [{ role: "system", content: MASS_SYSTEM_PROMPT }, { role: "user", content: massPrompt }],
      stream: true,
    }),
  });

  if (!response.ok) return handleAIError(response);
  return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
}

async function handleAIError(response: Response) {
  if (response.status === 429) {
    return new Response(JSON.stringify({ error: "Limite de requêtes dépassée, réessayez dans quelques instants." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (response.status === 402) {
    return new Response(JSON.stringify({ error: "Crédits insuffisants. Veuillez ajouter des crédits." }), {
      status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const errorText = await response.text();
  console.error("AI gateway error:", response.status, errorText);
  return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
    status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
