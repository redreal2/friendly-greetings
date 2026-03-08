import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Globe, Mountain, Crown, Users, Home, Orbit, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavedUniverse } from '@/hooks/useSaveUniverse';

interface SavedUniversesViewerProps {
  universes: SavedUniverse[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

function TreeItem({ label, type, children, depth = 0 }: { label: string; type: string; children?: React.ReactNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);

  const icons: Record<string, React.ReactNode> = {
    universe: <Sparkles className="w-4 h-4" />,
    galaxy: <Orbit className="w-4 h-4" />,
    planet: <Globe className="w-4 h-4" />,
    continent: <Mountain className="w-4 h-4" />,
    nation: <Crown className="w-4 h-4" />,
    race: <Users className="w-4 h-4" />,
    family: <Home className="w-4 h-4" />,
  };

  const colors: Record<string, string> = {
    universe: 'text-primary',
    galaxy: 'text-secondary',
    planet: 'text-cosmic-blue',
    continent: 'text-cosmic-gold',
    nation: 'text-cosmic-pink',
    race: 'text-accent',
    family: 'text-primary',
  };

  return (
    <div className="ml-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors w-full text-left"
      >
        <span className={colors[type]}>{icons[type]}</span>
        {children ? (
          expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : <span className="w-3" />}
        <span className={`font-medium text-sm ${colors[type]}`}>{label}</span>
        <Badge variant="outline" className="text-[10px] capitalize ml-auto opacity-60">{type}</Badge>
      </button>
      <AnimatePresence>
        {expanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-6 border-l border-border/30 pl-3 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SavedUniversesViewer({ universes, isLoading, onDelete }: SavedUniversesViewerProps) {
  if (isLoading) {
    return (
      <Card className="card-cosmic">
        <CardContent className="py-8 text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <Sparkles className="w-8 h-8 text-primary mx-auto" />
          </motion.div>
          <p className="text-muted-foreground mt-3">Chargement de vos univers...</p>
        </CardContent>
      </Card>
    );
  }

  if (!universes.length) {
    return (
      <Card className="card-cosmic">
        <CardContent className="py-8 text-center">
          <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucun univers sauvegardé. Créez-en un !</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {universes.map((universe) => (
        <Card key={universe.id} className="card-cosmic">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg glow-text">{universe.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(universe.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' • '}
                  {countElements(universe)} éléments
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(universe.id)} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {universe.galaxies.map((galaxy) => (
              <TreeItem key={galaxy.id} label={galaxy.name} type="galaxy" depth={0}>
                {galaxy.planets.map((planet) => (
                  <TreeItem key={planet.id} label={planet.name} type="planet" depth={1}>
                    {planet.continents.map((continent) => (
                      <TreeItem key={continent.id} label={continent.name} type="continent" depth={2}>
                        {continent.nations.map((nation) => (
                          <TreeItem key={nation.id} label={nation.name} type="nation" depth={3}>
                            {nation.races.map((race) => (
                              <TreeItem key={race.id} label={race.name} type="race" depth={4} />
                            ))}
                            {nation.families.map((family) => (
                              <TreeItem key={family.id} label={`${family.name}${family.motto ? ` — "${family.motto}"` : ''}`} type="family" depth={4} />
                            ))}
                          </TreeItem>
                        ))}
                      </TreeItem>
                    ))}
                  </TreeItem>
                ))}
              </TreeItem>
            ))}
            {universe.galaxies.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-2">Aucune galaxie (élément seul)</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function countElements(u: SavedUniverse): number {
  let count = 1; // universe itself
  for (const g of u.galaxies) {
    count++;
    for (const p of g.planets) {
      count++;
      for (const c of p.continents) {
        count++;
        for (const n of c.nations) {
          count++;
          count += n.races.length;
          count += n.families.length;
        }
      }
    }
  }
  return count;
}
