import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Sparkles, Orbit, Globe, Mountain, Crown, Users, Home } from 'lucide-react';

export interface ScaleConfig {
  universes: number;
  galaxiesPerUniverse: number;
  planetsPerGalaxy: number;
  continentsPerPlanet: number;
  nationsPerContinent: number;
  racesPerNation: number;
  familiesPerNation: number;
}

interface ScaleControlsProps {
  scale: ScaleConfig;
  onChange: (scale: ScaleConfig) => void;
  disabled?: boolean;
}

const SCALE_FIELDS: { key: keyof ScaleConfig; label: string; icon: React.ReactNode; min: number }[] = [
  { key: 'universes', label: 'Univers', icon: <Sparkles className="w-4 h-4" />, min: 1 },
  { key: 'galaxiesPerUniverse', label: 'Galaxies / univers', icon: <Orbit className="w-4 h-4" />, min: 1 },
  { key: 'planetsPerGalaxy', label: 'Planètes / galaxie', icon: <Globe className="w-4 h-4" />, min: 1 },
  { key: 'continentsPerPlanet', label: 'Continents / planète', icon: <Mountain className="w-4 h-4" />, min: 1 },
  { key: 'nationsPerContinent', label: 'Nations / continent', icon: <Crown className="w-4 h-4" />, min: 1 },
  { key: 'racesPerNation', label: 'Races / nation', icon: <Users className="w-4 h-4" />, min: 0 },
  { key: 'familiesPerNation', label: 'Familles / nation', icon: <Home className="w-4 h-4" />, min: 0 },
];

export function computeTotalElements(scale: ScaleConfig): number {
  const u = scale.universes;
  const g = u * scale.galaxiesPerUniverse;
  const p = g * scale.planetsPerGalaxy;
  const co = p * scale.continentsPerPlanet;
  const n = co * scale.nationsPerContinent;
  const r = n * scale.racesPerNation;
  const f = n * scale.familiesPerNation;
  return u + g + p + co + n + r + f;
}

export function ScaleControls({ scale, onChange, disabled }: ScaleControlsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {SCALE_FIELDS.map((field) => (
        <motion.div
          key={field.key}
          className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2"
          whileHover={disabled ? {} : { scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm text-foreground/80">
              <span className="text-primary">{field.icon}</span>
              {field.label}
            </Label>
            <span className="text-sm font-mono text-primary font-bold">
              {scale[field.key]}
            </span>
          </div>
          <Input
            type="number"
            value={scale[field.key]}
            onChange={(e) =>
              onChange({ ...scale, [field.key]: Math.max(field.min, parseInt(e.target.value) || 0) })
            }
            onFocus={(e) => e.target.select()}
            min={field.min}
            disabled={disabled}
            className="h-8 w-full bg-background/50 border-border/50 font-mono text-center"
          />
        </motion.div>
      ))}
    </div>
  );
}
