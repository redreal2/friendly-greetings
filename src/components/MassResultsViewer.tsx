import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Globe, Mountain, Crown, Users, Home, Orbit, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface MassResultsViewerProps {
  data: Record<string, unknown>;
}

const typeColors: Record<string, string> = {
  universe: 'text-primary',
  galaxy: 'text-secondary',
  planet: 'text-cosmic-blue',
  continent: 'text-cosmic-gold',
  nation: 'text-cosmic-pink',
  race: 'text-accent',
  family: 'text-primary',
};

const typeIcons: Record<string, React.ReactNode> = {
  universe: <Sparkles className="w-4 h-4" />,
  galaxy: <Orbit className="w-4 h-4" />,
  planet: <Globe className="w-4 h-4" />,
  continent: <Mountain className="w-4 h-4" />,
  nation: <Crown className="w-4 h-4" />,
  race: <Users className="w-4 h-4" />,
  family: <Home className="w-4 h-4" />,
};

function TreeNode({ label, type, data, depth = 0 }: { label: string; type: string; data: Record<string, unknown>; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const colorClass = typeColors[type] || 'text-foreground';
  const icon = typeIcons[type] || <Sparkles className="w-4 h-4" />;

  // Separate nested arrays from scalar fields
  const nestedKeys = Object.keys(data).filter(k => Array.isArray(data[k]) && data[k] !== null);
  const scalarEntries = Object.entries(data).filter(([k, v]) => !Array.isArray(v) && typeof v !== 'object' && k !== 'name');

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: depth * 0.05 }}
      className="ml-2"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors w-full text-left group`}
      >
        <span className={colorClass}>{icon}</span>
        {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
        <span className={`font-medium text-sm ${colorClass}`}>{label}</span>
        <Badge variant="outline" className="text-[10px] capitalize ml-auto opacity-60">{type}</Badge>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-6 border-l border-border/30 pl-3 overflow-hidden"
          >
            {/* Scalar fields */}
            {scalarEntries.length > 0 && (
              <div className="py-1 space-y-0.5">
                {scalarEntries.slice(0, 8).map(([key, value]) => (
                  <p key={key} className="text-xs text-muted-foreground">
                    <span className="text-foreground/60">{key.replace(/_/g, ' ')}:</span>{' '}
                    <span className="text-foreground/80">{String(value).slice(0, 120)}{String(value).length > 120 ? '...' : ''}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Nested children */}
            {nestedKeys.map(key => {
              const children = data[key] as Record<string, unknown>[];
              if (!Array.isArray(children)) return null;
              const childType = key === 'galaxies' ? 'galaxy' :
                key === 'planets' ? 'planet' :
                key === 'continents' ? 'continent' :
                key === 'nations' ? 'nation' :
                key === 'races' ? 'race' :
                key === 'families' ? 'family' :
                key === 'universes' ? 'universe' :
                key === 'notable_members' ? 'family' :
                key === 'notable_events' ? 'universe' :
                key === 'notable_regions' ? 'galaxy' :
                key === 'major_cities' ? 'nation' :
                key === 'sub_races' ? 'race' : 'universe';

              return children.map((child, idx) => (
                <TreeNode
                  key={`${key}-${idx}`}
                  label={(child as any).name || `${key} #${idx + 1}`}
                  type={childType}
                  data={child}
                  depth={depth + 1}
                />
              ));
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function MassResultsViewer({ data }: MassResultsViewerProps) {
  const totalElements = (data.total_elements as number) || 0;
  const universes = (data.universes as Record<string, unknown>[]) || [];

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'universe-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exporté en JSON !');
  };

  return (
    <Card className="card-cosmic">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full bg-cosmic-gold/20 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-5 h-5 text-cosmic-gold" />
          </motion.div>
          <div>
            <CardTitle className="text-xl glow-text">Univers Généré</CardTitle>
            <p className="text-sm text-muted-foreground">{totalElements} éléments interconnectés</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Copy className="w-3 h-3" />
          Exporter JSON
        </Button>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto">
        {universes.map((universe, idx) => (
          <TreeNode
            key={idx}
            label={(universe as any).name || `Univers #${idx + 1}`}
            type="universe"
            data={universe}
            depth={0}
          />
        ))}
      </CardContent>
    </Card>
  );
}
