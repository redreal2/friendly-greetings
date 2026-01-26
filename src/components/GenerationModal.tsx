import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { useUniverseGenerator } from '@/hooks/useUniverseGenerator';
import { toast } from 'sonner';

interface GenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'universe' | 'galaxy' | 'planet' | 'continent' | 'nation' | 'race' | 'family';
  onGenerated: (data: Record<string, unknown>) => void;
  context?: Record<string, unknown>;
}

const typeLabels: Record<string, { title: string; placeholder: string }> = {
  universe: {
    title: 'Créer un Univers',
    placeholder: 'Décris l\'univers que tu veux créer... Ex: Un univers où la magie provient des étoiles mourantes, avec des lois physiques différentes permettant le voyage entre dimensions...',
  },
  galaxy: {
    title: 'Créer une Galaxie',
    placeholder: 'Décris la galaxie... Ex: Une galaxie créée par de la magie ancienne, spirale avec des nébuleuses de cristal...',
  },
  planet: {
    title: 'Créer une Planète',
    placeholder: 'Décris la planète... Ex: Une Super-Terre de 72 000 km de diamètre avec 3g de gravité, 3 continents majeurs...',
  },
  continent: {
    title: 'Créer un Continent',
    placeholder: 'Décris le continent... Ex: Le berceau des races anciennes, 700 millions de km², climat varié des tropiques aux glaciers...',
  },
  nation: {
    title: 'Créer une Nation',
    placeholder: 'Décris la nation... Ex: Un Empire Humain féodal avec un Empereur vieux de 42 ans de règne, 47 provinces, capitale de 80 millions d\'habitants...',
  },
  race: {
    title: 'Créer une Race',
    placeholder: 'Décris la race... Ex: Des elfes immortels vivant 1500 ans, 89% de mages innés, liés à l\'Arbre-Monde...',
  },
  family: {
    title: 'Créer une Famille Noble',
    placeholder: 'Décris la famille... Ex: La dynastie Soltharis, famille impériale régnant depuis 800 ans, 12 branches principales...',
  },
};

export function GenerationModal({ open, onOpenChange, type, onGenerated, context }: GenerationModalProps) {
  const [prompt, setPrompt] = useState('');
  const { generate, isGenerating, streamedContent, error } = useUniverseGenerator();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez décrire ce que vous voulez créer');
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl card-cosmic border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl glow-text flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Décris en détail ce que tu veux créer. L'IA générera un contenu riche et cohérent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder={config.placeholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[150px] bg-muted/50 border-border/50 focus:border-primary/50 resize-none"
            disabled={isGenerating}
          />

          {isGenerating && streamedContent && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30 max-h-[200px] overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-2">Génération en cours...</p>
              <div className="text-sm font-mono text-foreground/80 whitespace-pre-wrap typing-cursor">
                {streamedContent.slice(0, 500)}
                {streamedContent.length > 500 && '...'}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="btn-cosmic"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
