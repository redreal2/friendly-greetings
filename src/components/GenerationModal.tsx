import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useUniverseGenerator } from '@/hooks/useUniverseGenerator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface GenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'universe' | 'galaxy' | 'planet' | 'continent' | 'nation' | 'race' | 'family';
  onGenerated: (data: Record<string, unknown>) => void;
  context?: Record<string, unknown>;
}

const typeLabels: Record<string, { title: string; placeholder: string }> = {
  universe: { title: 'Créer un Univers', placeholder: 'Décris l\'univers... Ex: Un univers où la magie provient des étoiles mourantes...' },
  galaxy: { title: 'Créer une Galaxie', placeholder: 'Décris la galaxie... Ex: Spirale avec nébuleuses de cristal...' },
  planet: { title: 'Créer une Planète', placeholder: 'Décris la planète... Ex: Super-Terre de 72 000 km avec 3g de gravité...' },
  continent: { title: 'Créer un Continent', placeholder: 'Décris le continent... Ex: Berceau des races anciennes, 700M km²...' },
  nation: { title: 'Créer une Nation', placeholder: 'Décris la nation... Ex: Empire féodal de 47 provinces...' },
  race: { title: 'Créer une Race', placeholder: 'Décris la race... Ex: Elfes immortels liés à l\'Arbre-Monde...' },
  family: { title: 'Créer une Famille Noble', placeholder: 'Décris la famille... Ex: Dynastie Soltharis régnant depuis 800 ans...' },
};

export function GenerationModal({ open, onOpenChange, type, onGenerated, context }: GenerationModalProps) {
  const [prompt, setPrompt] = useState('');
  const { generate, isGenerating, streamedContent, error, progress, cancel } = useUniverseGenerator();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Décris ce que tu veux créer');
      return;
    }

    const result = await generate({ prompt, type, context });
    if (result) {
      toast.success('Création terminée !');
      onGenerated(result);
      setPrompt('');
      onOpenChange(false);
    } else if (error) {
      toast.error(error);
    }
  };

  const config = typeLabels[type];

  return (
    <Dialog open={open} onOpenChange={isGenerating ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-2xl card-cosmic border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl glow-text flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {config.title}
          </DialogTitle>
          <DialogDescription>L'IA génère du contenu riche et cohérent.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder={config.placeholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] bg-muted/50 border-border/50 focus:border-primary/50 resize-none"
            disabled={isGenerating}
          />

          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Génération...
                  </span>
                  <span className="text-primary font-mono">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                {streamedContent && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30 max-h-[150px] overflow-y-auto">
                    <div className="text-xs font-mono text-foreground/60 whitespace-pre-wrap typing-cursor">
                      {streamedContent.slice(-500)}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3">
            {isGenerating ? (
              <Button variant="destructive" onClick={cancel} className="gap-2">
                <X className="w-4 h-4" /> Annuler
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                <Button onClick={handleGenerate} disabled={!prompt.trim()} className="btn-cosmic gap-2">
                  <Sparkles className="w-4 h-4" /> Générer
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
