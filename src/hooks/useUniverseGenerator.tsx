import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-universe`;

interface GenerateOptions {
  prompt: string;
  type: 'universe' | 'galaxy' | 'planet' | 'continent' | 'nation' | 'race' | 'family' | 'expand';
  context?: Record<string, unknown>;
}

interface MassGenerateOptions {
  prompt: string;
  scale: {
    universes: number;
    galaxiesPerUniverse: number;
    planetsPerGalaxy: number;
    continentsPerPlanet: number;
    nationsPerContinent: number;
    racesPerNation: number;
    familiesPerNation: number;
  };
  context?: Record<string, unknown>;
}

function parseSSEStream(textBuffer: string, onContent: (content: string) => void): { remaining: string; done: boolean } {
  let remaining = textBuffer;
  let done = false;
  let newlineIndex: number;

  while ((newlineIndex = remaining.indexOf('\n')) !== -1) {
    let line = remaining.slice(0, newlineIndex);
    remaining = remaining.slice(newlineIndex + 1);

    if (line.endsWith('\r')) line = line.slice(0, -1);
    if (line.startsWith(':') || line.trim() === '') continue;
    if (!line.startsWith('data: ')) continue;

    const jsonStr = line.slice(6).trim();
    if (jsonStr === '[DONE]') {
      done = true;
      break;
    }

    try {
      const parsed = JSON.parse(jsonStr);
      const content = parsed.choices?.[0]?.delta?.content as string | undefined;
      if (content) onContent(content);
    } catch {
      remaining = line + '\n' + remaining;
      break;
    }
  }

  return { remaining, done };
}

export function useUniverseGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const streamResponse = useCallback(async (response: Response): Promise<Record<string, unknown> | null> => {
    if (!response.body) throw new Error('Pas de réponse du serveur');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let fullContent = '';

    const onContent = (content: string) => {
      fullContent += content;
      setStreamedContent(fullContent);
      // Estimate progress based on content length
      const estimated = Math.min(95, (fullContent.length / 5000) * 100);
      setProgress(estimated);
    };

    let streamDone = false;
    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });
      const result = parseSSEStream(textBuffer, onContent);
      textBuffer = result.remaining;
      streamDone = result.done;
    }

    setProgress(100);

    // Parse final JSON - try multiple strategies
    try {
      // Strategy 1: Find outermost JSON object
      const firstBrace = fullContent.indexOf('{');
      const lastBrace = fullContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = fullContent.slice(firstBrace, lastBrace + 1);
        return JSON.parse(jsonStr);
      }
    } catch (parseError) {
      console.warn('Strategy 1 failed, trying cleanup...', parseError);
      try {
        // Strategy 2: Clean up common issues
        const firstBrace = fullContent.indexOf('{');
        const lastBrace = fullContent.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          let jsonStr = fullContent.slice(firstBrace, lastBrace + 1);
          // Remove markdown code fences
          jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
          // Fix trailing commas before } or ]
          jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
          // Fix unescaped control characters
          jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, (c) => c === '\n' || c === '\r' || c === '\t' ? c : '');
          return JSON.parse(jsonStr);
        }
      } catch (parseError2) {
        console.error('Failed to parse JSON after cleanup:', parseError2);
      }
    }
    return null;
  }, []);

  const generate = useCallback(async ({ prompt, type, context }: GenerateOptions): Promise<Record<string, unknown> | null> => {
    setIsGenerating(true);
    setStreamedContent('');
    setError(null);
    setProgress(0);
    abortRef.current = new AbortController();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(GENERATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ prompt, type, context }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const result = await streamResponse(response);
      setIsGenerating(false);
      return result;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setError('Génération annulée');
      } else {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
      setIsGenerating(false);
      return null;
    }
  }, [streamResponse]);

  const massGenerate = useCallback(async ({ prompt, scale, context }: MassGenerateOptions): Promise<Record<string, unknown> | null> => {
    setIsGenerating(true);
    setStreamedContent('');
    setError(null);
    setProgress(0);
    abortRef.current = new AbortController();

    try {
      const response = await fetch(GENERATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt, mode: 'mass', scale, context }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const result = await streamResponse(response);
      setIsGenerating(false);
      return result;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setError('Génération annulée');
      } else {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
      setIsGenerating(false);
      return null;
    }
  }, [streamResponse]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setStreamedContent('');
    setError(null);
    setProgress(0);
  }, []);

  return {
    generate,
    massGenerate,
    cancel,
    isGenerating,
    streamedContent,
    error,
    progress,
    reset,
  };
}
