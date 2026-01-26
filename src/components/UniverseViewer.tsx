import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Globe, Mountain, Crown, Users, Home, Sparkles } from 'lucide-react';

interface UniverseViewerProps {
  data: Record<string, unknown>;
  type: string;
  onExpand?: (type: string, context: Record<string, unknown>) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  universe: <Sparkles className="w-5 h-5" />,
  galaxy: <Globe className="w-5 h-5" />,
  planet: <Globe className="w-5 h-5" />,
  continent: <Mountain className="w-5 h-5" />,
  nation: <Crown className="w-5 h-5" />,
  race: <Users className="w-5 h-5" />,
  family: <Home className="w-5 h-5" />,
};

export function UniverseViewer({ data, type, onExpand }: UniverseViewerProps) {
  const name = (data.name as string) || 'Sans nom';
  const icon = typeIcons[type] || <Sparkles className="w-5 h-5" />;

  const renderField = (key: string, value: unknown) => {
    if (key === 'name' || key === 'id' || value === null || value === undefined) return null;
    
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (typeof value === 'object' && Array.isArray(value)) {
      return (
        <div key={key} className="mb-4">
          <h4 className="text-sm font-semibold text-primary mb-2">{label}</h4>
          <div className="space-y-2">
            {value.map((item, idx) => (
              <div key={idx} className="p-2 bg-muted/30 rounded-md text-sm">
                {typeof item === 'object' ? (
                  Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                    <p key={k}><span className="text-muted-foreground">{k}:</span> {String(v)}</p>
                  ))
                ) : (
                  String(item)
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (typeof value === 'number') {
      return (
        <div key={key} className="flex justify-between items-center py-2 border-b border-border/30">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Badge variant="secondary" className="font-mono">
            {value.toLocaleString()}
          </Badge>
        </div>
      );
    }
    
    return (
      <div key={key} className="mb-4">
        <h4 className="text-sm font-semibold text-primary mb-1">{label}</h4>
        <p className="text-sm text-foreground/80 leading-relaxed">{String(value)}</p>
      </div>
    );
  };

  const expandOptions: Record<string, string[]> = {
    universe: ['galaxy'],
    galaxy: ['planet'],
    planet: ['continent'],
    continent: ['nation'],
    nation: ['race', 'family'],
    race: ['family'],
  };

  const nextTypes = expandOptions[type] || [];

  return (
    <Card className="card-cosmic">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl glow-text">{name}</CardTitle>
          <Badge variant="outline" className="mt-1 capitalize">{type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(data).map(([key, value]) => renderField(key, value))}
        
        {nextTypes.length > 0 && onExpand && (
          <div className="pt-4 border-t border-border/30">
            <p className="text-sm text-muted-foreground mb-3">Ajouter des éléments :</p>
            <div className="flex flex-wrap gap-2">
              {nextTypes.map((nextType) => (
                <Button
                  key={nextType}
                  variant="outline"
                  size="sm"
                  onClick={() => onExpand(nextType, data)}
                  className="group"
                >
                  {typeIcons[nextType]}
                  <span className="ml-1 capitalize">{nextType}</span>
                  <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
