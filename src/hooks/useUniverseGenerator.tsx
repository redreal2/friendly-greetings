import { useState, useCallback } from 'react';

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-universe`;

interface GenerateOptions {
  prompt: string;
  type: 'universe' | 'galaxy' | 'planet' | 'continent' | 'nation' | 'race' | 'family' | 'expand';
  context?: Record<string, unknown>;
}

export function useUniverseGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async ({ prompt, type, context }: GenerateOptions): Promise<Record<string, unknown> | null> => {
    setIsGenerating(true);
    setStreamedContent('');
    setError(null);

    try {
      const response = await fetch(GENERATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt, type, context }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      if (!response.body) throw new Error('Pas de réponse du serveur');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullContent = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setStreamedContent(fullContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Parse final JSON result
      try {
        // Clean up the response - find JSON object
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setIsGenerating(false);
          return parsed;
        }
      } catch (parseError) {
        console.error('Failed to parse generated content:', parseError);
      }

      setIsGenerating(false);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      setIsGenerating(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStreamedContent('');
    setError(null);
  }, []);

  return {
    generate,
    isGenerating,
    streamedContent,
    error,
    reset,
  };
}
