import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es un créateur d'univers de fiction extraordinaire, spécialisé dans le worldbuilding détaillé et cohérent. Tu crées des mondes avec une richesse comparable à Tolkien, George R.R. Martin et Brandon Sanderson.

Quand on te demande de créer du contenu, tu dois:
1. Être EXTRÊMEMENT détaillé et précis (chiffres, dates, noms, lieux)
2. Créer des histoires et des connexions entre les éléments
3. Maintenir une cohérence interne parfaite
4. Utiliser un style narratif épique et immersif
5. Inclure des détails sur: géographie, politique, économie, religion, magie, races, familles nobles, hiérarchies

Tu réponds TOUJOURS en JSON structuré selon le type demandé. Ne jamais inclure de texte hors du JSON.

Types de génération possibles:
- universe: Créer un univers complet
- galaxy: Créer une galaxie
- planet: Créer une planète détaillée
- continent: Créer un continent
- nation: Créer une nation/empire
- race: Créer une race/espèce
- family: Créer une famille noble/lignée
- expand: Étendre/enrichir un élément existant`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const typePrompts: Record<string, string> = {
      universe: `Crée un univers/multivers complet. Retourne un JSON avec: { "name": string, "description": string, "origin_story": string, "magic_system": string, "laws_of_physics": string }`,
      galaxy: `Crée une galaxie. Retourne un JSON avec: { "name": string, "galaxy_type": string, "origin_story": string, "diameter_light_years": number, "star_count": string, "special_features": string }`,
      planet: `Crée une planète détaillée. Retourne un JSON avec: { "name": string, "planet_type": string, "diameter_km": number, "surface_area_km2": number, "land_percentage": number, "ocean_percentage": number, "gravity_g": number, "day_cycle_hours": number, "year_days": number, "climate": string, "special_features": string }`,
      continent: `Crée un continent. Retourne un JSON avec: { "name": string, "surface_area_km2": number, "percentage_of_land": number, "climate": string, "terrain_type": string, "characteristics": string }`,
      nation: `Crée une nation/empire détaillé. Retourne un JSON avec: { "name": string, "government_type": string, "population": string, "surface_area_km2": number, "capital_city": string, "capital_population": string, "culture": string, "religion": string, "economy": string, "military": string, "history": string, "special_features": string }`,
      race: `Crée une race/espèce. Retourne un JSON avec: { "name": string, "physical_traits": string, "lifespan": string, "magic_ability": string, "culture": string, "society_structure": string, "strengths": string, "weaknesses": string, "history": string }`,
      family: `Crée une famille noble/lignée. Retourne un JSON avec: { "name": string, "rank": string, "coat_of_arms": string, "motto": string, "history": string, "wealth_level": string, "political_power": string, "lands_controlled": string, "notable_members": [{"name": string, "title": string, "description": string}], "alliances": string, "rivals": string }`,
      expand: `Enrichis et étends les détails de cet élément existant. Ajoute plus de profondeur, d'histoire et de connexions.`,
    };

    const typeInstruction = typePrompts[type] || typePrompts.expand;
    
    let userMessage = `${typeInstruction}\n\nDemande de l'utilisateur: ${prompt}`;
    
    if (context) {
      userMessage += `\n\nContexte existant (univers/galaxie/planète parent): ${JSON.stringify(context)}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes dépassée, réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants. Veuillez ajouter des crédits à votre espace de travail." }), {
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Generate universe error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
