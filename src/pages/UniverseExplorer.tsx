import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StarField } from '@/components/StarField';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Orbit, Globe, Mountain, Crown, Users, Home,
  ChevronDown, ChevronRight, ArrowLeft, Loader2, Eye
} from 'lucide-react';

type NodeType = 'universe' | 'galaxy' | 'planet' | 'continent' | 'nation' | 'race' | 'family';

interface TreeNode {
  id: string;
  name: string;
  type: NodeType;
  children: TreeNode[];
}

const ICONS: Record<NodeType, React.ReactNode> = {
  universe: <Sparkles className="w-4 h-4" />,
  galaxy: <Orbit className="w-4 h-4" />,
  planet: <Globe className="w-4 h-4" />,
  continent: <Mountain className="w-4 h-4" />,
  nation: <Crown className="w-4 h-4" />,
  race: <Users className="w-4 h-4" />,
  family: <Home className="w-4 h-4" />,
};

const COLORS: Record<NodeType, string> = {
  universe: 'text-primary',
  galaxy: 'text-secondary',
  planet: 'text-cosmic-blue',
  continent: 'text-cosmic-gold',
  nation: 'text-cosmic-pink',
  race: 'text-accent',
  family: 'text-primary',
};

const BG_COLORS: Record<NodeType, string> = {
  universe: 'bg-primary/10 border-primary/30',
  galaxy: 'bg-secondary/10 border-secondary/30',
  planet: 'bg-cosmic-blue/10 border-cosmic-blue/30',
  continent: 'bg-cosmic-gold/10 border-cosmic-gold/30',
  nation: 'bg-cosmic-pink/10 border-cosmic-pink/30',
  race: 'bg-accent/10 border-accent/30',
  family: 'bg-primary/10 border-primary/30',
};

// Labels for DB columns
const FIELD_LABELS: Record<string, string> = {
  name: 'Nom',
  description: 'Description',
  origin_story: 'Histoire d\'origine',
  magic_system: 'Système de magie',
  laws_of_physics: 'Lois physiques',
  galaxy_type: 'Type de galaxie',
  star_count: 'Nombre d\'étoiles',
  diameter_light_years: 'Diamètre (années-lumière)',
  special_features: 'Particularités',
  planet_type: 'Type de planète',
  diameter_km: 'Diamètre (km)',
  surface_area_km2: 'Surface (km²)',
  gravity_g: 'Gravité (g)',
  day_cycle_hours: 'Durée du jour (h)',
  year_days: 'Durée de l\'année (jours)',
  land_percentage: 'Terres (%)',
  ocean_percentage: 'Océans (%)',
  climate: 'Climat',
  terrain_type: 'Type de terrain',
  percentage_of_land: '% des terres',
  characteristics: 'Caractéristiques',
  government_type: 'Gouvernement',
  population: 'Population',
  capital_city: 'Capitale',
  capital_population: 'Population capitale',
  culture: 'Culture',
  religion: 'Religion',
  economy: 'Économie',
  military: 'Armée',
  history: 'Histoire',
  physical_traits: 'Traits physiques',
  lifespan: 'Espérance de vie',
  magic_ability: 'Capacités magiques',
  society_structure: 'Structure sociale',
  strengths: 'Forces',
  weaknesses: 'Faiblesses',
  rank: 'Rang',
  motto: 'Devise',
  coat_of_arms: 'Blason',
  wealth_level: 'Richesse',
  political_power: 'Pouvoir politique',
  lands_controlled: 'Terres contrôlées',
  notable_members: 'Membres notables',
  alliances: 'Alliances',
  rivals: 'Rivaux',
};

const HIDDEN_FIELDS = ['id', 'created_at', 'updated_at', 'user_id', 'universe_id', 'galaxy_id', 'planet_id', 'continent_id', 'nation_id', 'race_id'];

export default function UniverseExplorer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<{ type: NodeType; id: string } | null>(null);
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Build tree
  const buildTree = useCallback(async () => {
    if (!id || !user) return;
    setLoading(true);

    try {
      const { data: universe } = await supabase.from('universes').select('id, name').eq('id', id).single();
      if (!universe) { navigate('/'); return; }

      const { data: galaxies } = await supabase.from('galaxies').select('id, name').eq('universe_id', id);
      const galaxyNodes: TreeNode[] = [];

      for (const g of galaxies || []) {
        const { data: planets } = await supabase.from('planets').select('id, name').eq('galaxy_id', g.id);
        const planetNodes: TreeNode[] = [];

        for (const p of planets || []) {
          const { data: continents } = await supabase.from('continents').select('id, name').eq('planet_id', p.id);
          const continentNodes: TreeNode[] = [];

          for (const c of continents || []) {
            const { data: nations } = await supabase.from('nations').select('id, name').eq('continent_id', c.id);
            const nationNodes: TreeNode[] = [];

            for (const n of nations || []) {
              const { data: races } = await supabase.from('races').select('id, name').eq('nation_id', n.id);
              const { data: families } = await supabase.from('families').select('id, name').eq('nation_id', n.id);

              nationNodes.push({
                id: n.id, name: n.name, type: 'nation',
                children: [
                  ...(races || []).map(r => ({ id: r.id, name: r.name, type: 'race' as NodeType, children: [] })),
                  ...(families || []).map(f => ({ id: f.id, name: f.name, type: 'family' as NodeType, children: [] })),
                ],
              });
            }

            continentNodes.push({ id: c.id, name: c.name, type: 'continent', children: nationNodes });
          }

          planetNodes.push({ id: p.id, name: p.name, type: 'planet', children: continentNodes });
        }

        galaxyNodes.push({ id: g.id, name: g.name, type: 'galaxy', children: planetNodes });
      }

      setTree({ id: universe.id, name: universe.name, type: 'universe', children: galaxyNodes });
      // Auto-select universe
      setSelectedNode({ type: 'universe', id: universe.id });
    } catch (err) {
      console.error('Tree build error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => { buildTree(); }, [buildTree]);

  // Load full details for a node
  const loadDetails = useCallback(async (type: NodeType, nodeId: string) => {
    setLoadingDetails(true);
    setSelectedNode({ type, id: nodeId });
    try {
      const table = type === 'universe' ? 'universes' : type === 'galaxy' ? 'galaxies' : type === 'planet' ? 'planets' : type === 'continent' ? 'continents' : type === 'nation' ? 'nations' : type === 'race' ? 'races' : 'families';
      const { data, error } = await supabase.from(table).select('*').eq('id', nodeId).single();
      if (error) throw error;
      setDetails(data as Record<string, unknown>);
    } catch (err) {
      console.error('Load details error:', err);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // Auto-load universe details on mount
  useEffect(() => {
    if (selectedNode) loadDetails(selectedNode.type, selectedNode.id);
  }, []); // eslint-disable-line

  if (authLoading || loading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!user) { navigate('/auth'); return null; }

  return (
    <div className="min-h-screen cosmic-bg relative overflow-hidden flex flex-col">
      <StarField />

      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b border-border/30 bg-background/50 backdrop-blur-md shrink-0"
      >
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-display glow-text">{tree?.name || 'Explorateur'}</h1>
          </div>
          <Badge variant="outline" className="ml-2 text-xs">
            {countNodes(tree)} éléments
          </Badge>
        </div>
      </motion.header>

      {/* Main content: sidebar + detail */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar Tree */}
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-80 border-r border-border/30 bg-background/30 backdrop-blur-md shrink-0"
        >
          <ScrollArea className="h-[calc(100vh-57px)]">
            <div className="p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-2">Hiérarchie</p>
              {tree && (
                <SidebarTreeNode
                  node={tree}
                  depth={0}
                  selectedId={selectedNode?.id || ''}
                  onSelect={loadDetails}
                />
              )}
            </div>
          </ScrollArea>
        </motion.aside>

        {/* Detail Panel */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-57px)]">
            <div className="p-6 max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {loadingDetails ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center py-20"
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </motion.div>
                ) : details && selectedNode ? (
                  <motion.div
                    key={selectedNode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DetailView type={selectedNode.type} data={details} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Sélectionnez un élément dans l'arborescence</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}

// Sidebar tree node component
function SidebarTreeNode({ node, depth, selectedId, onSelect }: {
  node: TreeNode;
  depth: number;
  selectedId: string;
  onSelect: (type: NodeType, id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedId;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node.type, node.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md w-full text-left transition-all duration-200 group
          ${isSelected
            ? `${BG_COLORS[node.type]} border`
            : 'hover:bg-muted/50 border border-transparent'
          }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className={COLORS[node.type]}>{ICONS[node.type]}</span>
        {hasChildren ? (
          expanded
            ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
            : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
        ) : <span className="w-3 shrink-0" />}
        <span className={`text-sm truncate ${isSelected ? COLORS[node.type] + ' font-semibold' : 'text-foreground/80'}`}>
          {node.name}
        </span>
      </button>

      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <SidebarTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Detail view component
function DetailView({ type, data }: { type: NodeType; data: Record<string, unknown> }) {
  const name = (data.name as string) || 'Sans nom';

  const visibleFields = Object.entries(data).filter(
    ([key, val]) => !HIDDEN_FIELDS.includes(key) && key !== 'name' && val !== null && val !== undefined && val !== ''
  );

  return (
    <div>
      {/* Header */}
      <div className={`p-6 rounded-xl border mb-6 ${BG_COLORS[type]}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${COLORS[type]} bg-background/50`}>
            <span className="scale-150">{ICONS[type]}</span>
          </div>
          <div>
            <h2 className={`text-2xl font-display glow-text ${COLORS[type]}`}>{name}</h2>
            <Badge variant="outline" className="capitalize mt-1">{type}</Badge>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {visibleFields.map(([key, value]) => (
          <DetailField key={key} label={FIELD_LABELS[key] || key.replace(/_/g, ' ')} value={value} />
        ))}
      </div>
    </div>
  );
}

function tryParseJSON(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && (trimmed.endsWith('}') || trimmed.endsWith(']'))) {
      try { return JSON.parse(trimmed); } catch { /* fall through */ }
    }
  }
  return value;
}

function RenderValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const parsed = tryParseJSON(value);

  if (Array.isArray(parsed)) {
    return (
      <div className="space-y-2">
        {parsed.map((item, idx) => (
          <div key={idx} className="p-3 bg-muted/20 rounded-md border border-border/20">
            <RenderValue value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof parsed === 'object' && parsed !== null) {
    return (
      <div className="space-y-1.5">
        {Object.entries(parsed as Record<string, unknown>).map(([k, v]) => {
          const innerParsed = tryParseJSON(v);
          const isComplex = typeof innerParsed === 'object' && innerParsed !== null;
          return (
            <div key={k} className={isComplex ? 'mt-2' : ''}>
              <span className="text-xs font-semibold text-primary/80 capitalize">{k.replace(/_/g, ' ')}:</span>{' '}
              {isComplex ? (
                <div className="ml-3 mt-1">
                  <RenderValue value={innerParsed} depth={depth + 1} />
                </div>
              ) : (
                <span className="text-sm text-foreground/90">{String(v)}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return <span className="text-sm text-foreground/90">{String(parsed)}</span>;
}

function DetailField({ label, value }: { label: string; value: unknown }) {
  const parsed = tryParseJSON(value);

  // Complex objects/arrays
  if (typeof parsed === 'object' && parsed !== null) {
    return (
      <div className="card-cosmic rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary mb-3 capitalize">{label}</h4>
        <RenderValue value={parsed} />
      </div>
    );
  }

  // Numbers
  if (typeof value === 'number') {
    return (
      <div className="flex items-center justify-between py-3 px-4 card-cosmic rounded-lg">
        <span className="text-sm text-muted-foreground capitalize">{label}</span>
        <Badge variant="secondary" className="font-mono text-sm">{value.toLocaleString('fr-FR')}</Badge>
      </div>
    );
  }

  // Long text
  const strVal = String(value);
  if (strVal.length > 200) {
    return (
      <div className="card-cosmic rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary mb-2 capitalize">{label}</h4>
        <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{strVal}</p>
      </div>
    );
  }

  // Short text
  return (
    <div className="flex items-start gap-3 py-3 px-4 card-cosmic rounded-lg">
      <span className="text-sm text-muted-foreground capitalize shrink-0">{label}</span>
      <span className="text-sm text-foreground/90 text-right ml-auto">{strVal}</span>
    </div>
  );
}

function countNodes(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}
