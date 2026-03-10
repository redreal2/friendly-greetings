import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2, Zap, X } from 'lucide-react';
import { ScaleControls, ScaleConfig, computeTotalElements } from '@/components/ScaleControls';
import { useUniverseGenerator } from '@/hooks/useUniverseGenerator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface MassGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (data: Record<string, unknown>) => void;
}

export function MassGenerationModal({ open, onOpenChange, onGenerated }: MassGenerationModalProps) {
  const [prompt, setPrompt] = useState('');
  const [scale, setScale] = useState<ScaleConfig>({
    universes: 1,
    galaxiesPerUniverse: 2,
    planetsPerGalaxy: 3,
    continentsPerPlanet: 2,
    nationsPerContinent: 2,
    racesPerNation: 1,
    familiesPerNation: 1,
  });
  const { massGenerate, isGenerating, streamedContent, error, progress, cancel } = useUniverseGenerator();

  const totalElements = computeTotalElements(scale);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Décris le thème de ton univers');
      return;
    }

    const result = await massGenerate({ prompt, scale });

    if (result) {
      toast.success(`${totalElements} éléments générés avec succès !`);
      onGenerated(result);
      setPrompt('');
      onOpenChange(false);
    } else {
      toast.error(error || 'Échec du parsing JSON. Réessayez avec moins d\'éléments.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={isGenerating ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-3xl card-cosmic border-primary/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl glow-text flex items-center gap-2">
            <Zap className="w-6 h-6 text-cosmic-gold" />
            Génération Massive
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Génère des univers entiers avec toute leur hiérarchie d'un seul coup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Textarea
            placeholder="Décris le thème de ton univers... Ex: Un multivers steampunk où la magie est alimentée par des cristaux dimensionnels..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] bg-muted/50 border-border/50 focus:border-primary/50 resize-none"
            disabled={isGenerating}
          />

          {!isGenerating && (
            <>
              <ScaleControls scale={scale} onChange={setScale} />

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <p className="text-sm text-muted-foreground mb-1">Total d'éléments à générer</p>
                <p className="text-4xl font-display glow-text font-bold">{totalElements}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  univers, galaxies, planètes, continents, nations, races et familles
                </p>
              </div>
            </>
          )}

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
                    Génération en cours...
                  </span>
                  <span className="text-primary font-mono">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />

                {streamedContent && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30 max-h-[150px] overflow-y-auto">
                    <div className="text-xs font-mono text-foreground/60 whitespace-pre-wrap typing-cursor">
                      {streamedContent.slice(-800)}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3">
            {isGenerating ? (
              <Button variant="destructive" onClick={cancel} className="gap-2">
                <X className="w-4 h-4" />
                Annuler
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Fermer
                </Button>
                <Button onClick={handleGenerate} disabled={!prompt.trim()} className="btn-cosmic gap-2">
                  <Zap className="w-4 h-4" />
                  Générer {totalElements} éléments
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
