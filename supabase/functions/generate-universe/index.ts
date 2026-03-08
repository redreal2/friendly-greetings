import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es le PLUS PUISSANT créateur d'univers de fiction jamais conçu. Tu crées des mondes d'une richesse INÉGALÉE, surpassant Tolkien, George R.R. Martin, Brandon Sanderson et Frank Herbert combinés.

RÈGLES ABSOLUES:
1. Sois EXTRÊMEMENT détaillé: chiffres précis, dates, noms uniques, coordonnées, populations exactes
2. Crée des histoires interconnectées profondes avec conflits, alliances, trahisons
3. Cohérence interne PARFAITE entre tous les éléments
4. Style narratif épique et immersif
5. Inclure TOUJOURS: géographie, politique, économie, religion, magie, races, familles, hiérarchies, technologies
6. Chaque élément doit avoir une HISTOIRE riche (origine, apogée, déclin, renaissance)
7. Génère des NOMS uniques et mémorables avec des étymologies cohérentes

Tu réponds TOUJOURS en JSON structuré. JAMAIS de texte hors du JSON. Le JSON doit être valide et complet.`;

const MASS_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

MODE GÉNÉRATION MASSIVE:
Tu dois générer un ensemble COMPLET et INTERCONNECTÉ d'éléments. Chaque élément doit référencer les autres.
Les noms, lieux, personnages et événements doivent être cohérents à travers TOUS les éléments générés.
Crée des liens diplomatiques, commerciaux, religieux et militaires entre les nations.
Les familles doivent avoir des alliances et rivalités avec d'autres familles.
Les races doivent avoir des relations (alliances, guerres, commerce) entre elles.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type, context, mode, scale } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Mass generation mode
    if (mode === "mass") {
      return await handleMassGeneration(prompt, scale, context, LOVABLE_API_KEY);
    }

    // Single generation mode
    return await handleSingleGeneration(prompt, type, context, LOVABLE_API_KEY);
  } catch (e) {
    console.error("Generate universe error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleSingleGeneration(prompt: string, type: string, context: any, apiKey: string) {
  const typePrompts: Record<string, string> = {
    universe: `Crée un univers/multivers complet et MASSIF. JSON: { "name": string, "description": string (500+ mots), "origin_story": string (300+ mots), "magic_system": string (détaillé), "laws_of_physics": string, "age_billions_years": number, "dimensions_count": number, "notable_events": [{"name": string, "date": string, "description": string}] }`,
    galaxy: `Crée une galaxie DÉTAILLÉE. JSON: { "name": string, "galaxy_type": string, "origin_story": string (200+ mots), "diameter_light_years": number, "star_count": string, "habitable_systems": number, "dominant_civilizations": string, "special_features": string, "notable_regions": [{"name": string, "description": string}] }`,
    planet: `Crée une planète ULTRA-DÉTAILLÉE. JSON: { "name": string, "planet_type": string, "diameter_km": number, "surface_area_km2": number, "land_percentage": number, "ocean_percentage": number, "gravity_g": number, "day_cycle_hours": number, "year_days": number, "moons_count": number, "atmosphere": string, "climate": string, "biomes": string, "dominant_species": string, "population": string, "special_features": string, "history": string (200+ mots) }`,
    continent: `Crée un continent RICHE. JSON: { "name": string, "surface_area_km2": number, "percentage_of_land": number, "climate": string, "terrain_type": string, "major_rivers": string, "mountain_ranges": string, "natural_resources": string, "flora_fauna": string, "characteristics": string, "history": string (200+ mots) }`,
    nation: `Crée une nation/empire COMPLET. JSON: { "name": string, "government_type": string, "ruler": string, "population": string, "surface_area_km2": number, "capital_city": string, "capital_population": string, "major_cities": [{"name": string, "population": string, "role": string}], "culture": string, "religion": string, "economy": string, "military": string, "technology_level": string, "history": string (300+ mots), "allies": string, "enemies": string, "special_features": string }`,
    race: `Crée une race/espèce DÉTAILLÉE. JSON: { "name": string, "physical_traits": string, "average_height_cm": number, "lifespan": string, "population": string, "magic_ability": string, "intelligence_level": string, "culture": string, "society_structure": string, "language": string, "religion": string, "strengths": string, "weaknesses": string, "sub_races": [{"name": string, "traits": string}], "history": string (200+ mots) }`,
    family: `Crée une famille/lignée ÉPIQUE. JSON: { "name": string, "rank": string, "coat_of_arms": string, "motto": string, "founding_year": string, "history": string (300+ mots), "wealth_level": string, "political_power": string, "lands_controlled": string, "notable_members": [{"name": string, "title": string, "birth_year": string, "description": string, "achievements": string}], "alliances": string, "rivals": string, "secrets": string, "heirlooms": string }`,
    expand: `Enrichis et étends MASSIVEMENT les détails de cet élément. Ajoute 3x plus de profondeur, d'histoire et de connexions.`,
  };

  const typeInstruction = typePrompts[type] || typePrompts.expand;
  let userMessage = `${typeInstruction}\n\nDemande: ${prompt}`;
  if (context) {
    userMessage += `\n\nContexte parent: ${JSON.stringify(context)}`;
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    return handleAIError(response);
  }

  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

async function handleMassGeneration(prompt: string, scale: any, context: any, apiKey: string) {
  const { universes = 1, galaxiesPerUniverse = 2, planetsPerGalaxy = 3, continentsPerPlanet = 2, nationsPerContinent = 2, racesPerNation = 1, familiesPerNation = 1 } = scale || {};

  const totalElements = universes + (universes * galaxiesPerUniverse) + (universes * galaxiesPerUniverse * planetsPerGalaxy) + (universes * galaxiesPerUniverse * planetsPerGalaxy * continentsPerPlanet) + (universes * galaxiesPerUniverse * planetsPerGalaxy * continentsPerPlanet * nationsPerContinent) + (universes * galaxiesPerUniverse * planetsPerGalaxy * continentsPerPlanet * nationsPerContinent * racesPerNation) + (universes * galaxiesPerUniverse * planetsPerGalaxy * continentsPerPlanet * nationsPerContinent * familiesPerNation);

  const massPrompt = `GÉNÉRATION MASSIVE D'UNIVERS - Crée TOUT d'un coup, interconnecté et cohérent.

Échelle demandée:
- ${universes} univers
- ${galaxiesPerUniverse} galaxies par univers
- ${planetsPerGalaxy} planètes par galaxie
- ${continentsPerPlanet} continents par planète
- ${nationsPerContinent} nations par continent  
- ${racesPerNation} races par nation
- ${familiesPerNation} familles nobles par nation

Total: ${totalElements} éléments interconnectés.

Instructions de l'utilisateur: ${prompt}

${context ? `Contexte existant: ${JSON.stringify(context)}` : ''}

RÉPONDS avec ce JSON EXACT:
{
  "total_elements": ${totalElements},
  "universes": [
    {
      "name": string,
      "description": string,
      "origin_story": string,
      "magic_system": string,
      "age_billions_years": number,
      "galaxies": [
        {
          "name": string,
          "galaxy_type": string,
          "star_count": string,
          "diameter_light_years": number,
          "planets": [
            {
              "name": string,
              "planet_type": string,
              "diameter_km": number,
              "gravity_g": number,
              "population": string,
              "climate": string,
              "continents": [
                {
                  "name": string,
                  "surface_area_km2": number,
                  "climate": string,
                  "terrain_type": string,
                  "nations": [
                    {
                      "name": string,
                      "government_type": string,
                      "population": string,
                      "capital_city": string,
                      "culture": string,
                      "military": string,
                      "races": [
                        {
                          "name": string,
                          "physical_traits": string,
                          "lifespan": string,
                          "magic_ability": string,
                          "population": string
                        }
                      ],
                      "families": [
                        {
                          "name": string,
                          "rank": string,
                          "motto": string,
                          "history": string,
                          "notable_members": [{"name": string, "title": string}]
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

IMPORTANT: Génère EXACTEMENT le nombre d'éléments demandés. Chaque élément doit être UNIQUE et DÉTAILLÉ. Les noms doivent être originaux et les descriptions riches.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: MASS_SYSTEM_PROMPT },
        { role: "user", content: massPrompt }
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    return handleAIError(response);
  }

  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

async function handleAIError(response: Response) {
  if (response.status === 429) {
    return new Response(JSON.stringify({ error: "Limite de requêtes dépassée, réessayez dans quelques instants." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (response.status === 402) {
    return new Response(JSON.stringify({ error: "Crédits insuffisants. Veuillez ajouter des crédits." }), {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const errorText = await response.text();
  console.error("AI gateway error:", response.status, errorText);
  return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
