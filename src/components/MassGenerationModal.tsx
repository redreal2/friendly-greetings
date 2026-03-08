import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, Zap, X, Globe, Mountain, Crown, Users, Home, Orbit } from 'lucide-react';
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
  const [scale, setScale] = useState({
    universes: 1,
    galaxiesPerUniverse: 2,
    planetsPerGalaxy: 3,
    continentsPerPlanet: 2,
    nationsPerContinent: 2,
    racesPerNation: 1,
    familiesPerNation: 1,
  });
  const { massGenerate, isGenerating, streamedContent, error, progress, cancel } = useUniverseGenerator();

  const totalElements =
    scale.universes +
    scale.universes * scale.galaxiesPerUniverse +
    scale.universes * scale.galaxiesPerUniverse * scale.planetsPerGalaxy +
    scale.universes * scale.galaxiesPerUniverse * scale.planetsPerGalaxy * scale.continentsPerPlanet +
    scale.universes * scale.galaxiesPerUniverse * scale.planetsPerGalaxy * scale.continentsPerPlanet * scale.nationsPerContinent +
    scale.universes * scale.galaxiesPerUniverse * scale.planetsPerGalaxy * scale.continentsPerPlanet * scale.nationsPerContinent * scale.racesPerNation +
    scale.universes * scale.galaxiesPerUniverse * scale.planetsPerGalaxy * scale.continentsPerPlanet * scale.nationsPerContinent * scale.familiesPerNation;

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

  const scaleControls = [
    { key: 'universes', label: 'Univers', icon: <Sparkles className="w-4 h-4" />, min: 1, max: 3 },
    { key: 'galaxiesPerUniverse', label: 'Galaxies / univers', icon: <Orbit className="w-4 h-4" />, min: 1, max: 5 },
    { key: 'planetsPerGalaxy', label: 'Planètes / galaxie', icon: <Globe className="w-4 h-4" />, min: 1, max: 5 },
    { key: 'continentsPerPlanet', label: 'Continents / planète', icon: <Mountain className="w-4 h-4" />, min: 1, max: 4 },
    { key: 'nationsPerContinent', label: 'Nations / continent', icon: <Crown className="w-4 h-4" />, min: 1, max: 4 },
    { key: 'racesPerNation', label: 'Races / nation', icon: <Users className="w-4 h-4" />, min: 0, max: 3 },
    { key: 'familiesPerNation', label: 'Familles / nation', icon: <Home className="w-4 h-4" />, min: 0, max: 3 },
  ];

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
            placeholder="Décris le thème de ton univers... Ex: Un multivers steampunk où la magie est alimentée par des cristaux dimensionnels, avec des civilisations en guerre pour le contrôle des portails entre dimensions..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] bg-muted/50 border-border/50 focus:border-primary/50 resize-none"
            disabled={isGenerating}
          />

          {/* Scale Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scaleControls.map((ctrl) => (
              <motion.div
                key={ctrl.key}
                className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="text-primary">{ctrl.icon}</span>
                    {ctrl.label}
                  </Label>
                  <span className="text-sm font-mono text-primary font-bold">
                    {scale[ctrl.key as keyof typeof scale]}
                  </span>
                </div>
                <Slider
                  value={[scale[ctrl.key as keyof typeof scale]]}
                  onValueChange={([v]) => setScale(prev => ({ ...prev, [ctrl.key]: v }))}
                  min={ctrl.min}
                  max={ctrl.max}
                  step={1}
                  disabled={isGenerating}
                  className="cursor-pointer"
                />
              </motion.div>
            ))}
          </div>

          {/* Total Counter */}
          <motion.div
            className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-sm text-muted-foreground mb-1">Total d'éléments à générer</p>
            <p className="text-4xl font-display glow-text font-bold">{totalElements}</p>
            <p className="text-xs text-muted-foreground mt-1">
              univers, galaxies, planètes, continents, nations, races et familles
            </p>
          </motion.div>

          {/* Progress */}
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

          {/* Actions */}
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
