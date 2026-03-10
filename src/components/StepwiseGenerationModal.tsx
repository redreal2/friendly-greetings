import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, Layers, X, Globe, Mountain, Crown, Users, Home, Orbit, Check } from 'lucide-react';
import { ScaleControls, ScaleConfig, computeTotalElements } from '@/components/ScaleControls';
import { useStepwiseGenerator } from '@/hooks/useStepwiseGenerator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface StepwiseGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  universe: <Sparkles className="w-4 h-4" />,
  galaxy: <Orbit className="w-4 h-4" />,
  planet: <Globe className="w-4 h-4" />,
  continent: <Mountain className="w-4 h-4" />,
  nation: <Crown className="w-4 h-4" />,
  race: <Users className="w-4 h-4" />,
  family: <Home className="w-4 h-4" />,
};

const ALL_STEPS = ['universe', 'galaxy', 'planet', 'continent', 'nation', 'race', 'family'] as const;

export function StepwiseGenerationModal({ open, onOpenChange, onComplete }: StepwiseGenerationModalProps) {
  const [prompt, setPrompt] = useState('');
  const [scale, setScale] = useState<ScaleConfig>({
    universes: 1,
    galaxiesPerUniverse: 2,
    planetsPerGalaxy: 2,
    continentsPerPlanet: 2,
    nationsPerContinent: 2,
    racesPerNation: 1,
    familiesPerNation: 1,
  });
  const { generate, isGenerating, stepProgress, streamedContent, error, cancel, reset, STEP_LABELS } = useStepwiseGenerator();

  const totalElements = computeTotalElements(scale);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Décris le thème de ton univers');
      return;
    }
    reset();
    const result = await generate(prompt, scale);
    if (result) {
      toast.success(`${totalElements} éléments générés et sauvegardés !`);
      onComplete();
      setPrompt('');
      onOpenChange(false);
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isGenerating ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-3xl card-cosmic border-primary/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl glow-text flex items-center gap-2">
            <Layers className="w-6 h-6 text-cosmic-gold" />
            Génération par Étapes
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Génère chaque niveau séparément pour une fiabilité maximale. Chaque élément est sauvegardé immédiatement.
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
                  Chaque élément généré et sauvegardé individuellement
                </p>
              </div>
            </>
          )}

          {/* Step Progress */}
          <AnimatePresence>
            {isGenerating && stepProgress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    {stepProgress.label}
                  </span>
                  <span className="text-primary font-mono">{stepProgress.overallProgress}%</span>
                </div>
                <Progress value={stepProgress.overallProgress} className="h-2" />

                <div className="flex flex-wrap gap-2">
                  {ALL_STEPS.map((step, idx) => {
                    const isCurrent = step === stepProgress.currentStep;
                    const isDone = idx < stepProgress.stepIndex;
                    const isSkipped = (step === 'race' && scale.racesPerNation === 0) || (step === 'family' && scale.familiesPerNation === 0);

                    return (
                      <motion.div
                        key={step}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isCurrent
                            ? 'bg-primary/20 border-primary/50 text-primary'
                            : isDone
                            ? 'bg-accent/20 border-accent/30 text-accent'
                            : isSkipped
                            ? 'bg-muted/20 border-border/20 text-muted-foreground/40 line-through'
                            : 'bg-muted/10 border-border/20 text-muted-foreground/60'
                        }`}
                        animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {isDone ? <Check className="w-3 h-3" /> : STEP_ICONS[step]}
                        {STEP_LABELS[step as keyof typeof STEP_LABELS]}
                      </motion.div>
                    );
                  })}
                </div>

                {streamedContent && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30 max-h-[120px] overflow-y-auto">
                    <div className="text-xs font-mono text-foreground/60 whitespace-pre-wrap typing-cursor">
                      {streamedContent.slice(-600)}
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
                  <Layers className="w-4 h-4" />
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
