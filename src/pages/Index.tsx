import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSaveUniverse } from '@/hooks/useSaveUniverse';
import { StarField } from '@/components/StarField';
import { GenerationCard } from '@/components/GenerationCard';
import { GenerationModal } from '@/components/GenerationModal';
import { MassGenerationModal } from '@/components/MassGenerationModal';
import { StepwiseGenerationModal } from '@/components/StepwiseGenerationModal';
import { UniverseViewer } from '@/components/UniverseViewer';
import { MassResultsViewer } from '@/components/MassResultsViewer';
import { SavedUniversesViewer } from '@/components/SavedUniversesViewer';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Sparkles, Globe, Mountain, Crown, Users, Home, LogOut, Zap, Orbit, Database, Layers
} from 'lucide-react';
import { toast } from 'sonner';

type GenerationType = 'universe' | 'galaxy' | 'planet' | 'continent' | 'nation' | 'race' | 'family';

interface GeneratedItem {
  type: GenerationType | 'mass';
  data: Record<string, unknown>;
}

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const { saveMassGeneration, saveSingleElement, loadUniverses, deleteUniverse, savedUniverses, isLoading: isLoadingSaved, isSaving } = useSaveUniverse();
  const [modalOpen, setModalOpen] = useState(false);
  const [massModalOpen, setMassModalOpen] = useState(false);
  const [stepwiseModalOpen, setStepwiseModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState<GenerationType>('universe');
  const [currentContext, setCurrentContext] = useState<Record<string, unknown> | undefined>();
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);

  useEffect(() => {
    if (user) loadUniverses();
  }, [user, loadUniverses]);

  if (loading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleOpenModal = (type: GenerationType, context?: Record<string, unknown>) => {
    setCurrentType(type);
    setCurrentContext(context);
    setModalOpen(true);
  };

  const handleGenerated = async (data: Record<string, unknown>) => {
    setGeneratedItems(prev => [...prev, { type: currentType, data }]);
    toast.success(`${currentType} créé !`);
    // Auto-save single element
    try {
      await saveSingleElement(currentType, data);
      toast.success('Sauvegardé automatiquement !');
      loadUniverses();
    } catch {
      // Already handled in hook
    }
  };

  const handleMassGenerated = async (data: Record<string, unknown>) => {
    setGeneratedItems(prev => [...prev, { type: 'mass', data }]);
    // Auto-save entire hierarchy
    await saveMassGeneration(data);
    loadUniverses();
  };

  const handleDeleteUniverse = async (id: string) => {
    if (confirm('Supprimer cet univers et tous ses éléments ?')) {
      await deleteUniverse(id);
    }
  };

  const creationTypes: { type: GenerationType; title: string; description: string; icon: React.ReactNode }[] = [
    { type: 'universe', title: 'Univers', description: 'Multivers complet avec lois physiques', icon: <Sparkles className="w-8 h-8 text-primary" /> },
    { type: 'galaxy', title: 'Galaxie', description: 'Galaxie avec systèmes stellaires', icon: <Orbit className="w-8 h-8 text-secondary" /> },
    { type: 'planet', title: 'Planète', description: 'Planète ultra-détaillée', icon: <Globe className="w-8 h-8 text-cosmic-blue" /> },
    { type: 'continent', title: 'Continent', description: 'Continent avec géographie riche', icon: <Mountain className="w-8 h-8 text-cosmic-gold" /> },
    { type: 'nation', title: 'Nation', description: 'Empire ou royaume complet', icon: <Crown className="w-8 h-8 text-cosmic-pink" /> },
    { type: 'race', title: 'Race', description: 'Espèce avec culture profonde', icon: <Users className="w-8 h-8 text-accent" /> },
    { type: 'family', title: 'Famille', description: 'Lignée noble épique', icon: <Home className="w-8 h-8 text-primary" /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="min-h-screen cosmic-bg relative overflow-hidden">
      <StarField />
      
      {/* Saving indicator */}
      {isSaving && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md"
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Database className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="text-sm text-primary">Sauvegarde...</span>
        </motion.div>
      )}

      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 border-b border-border/30 bg-background/50 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
              animate={{ boxShadow: ['0 0 15px hsl(265 85% 65% / 0.2)', '0 0 30px hsl(265 85% 65% / 0.4)', '0 0 15px hsl(265 85% 65% / 0.2)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-display glow-text">Universe Creator</h1>
          </div>
          <Button variant="ghost" onClick={() => { signOut(); toast.success('Déconnecté'); }} className="gap-2">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </motion.header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-display glow-text mb-4">
            Créez des Univers Entiers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Générez des galaxies, planètes, nations, races et familles nobles. Tout est sauvegardé automatiquement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setStepwiseModalOpen(true)}
                size="lg"
                className="btn-cosmic gap-3 text-lg px-8 py-6"
              >
                <Layers className="w-6 h-6" />
                Génération par Étapes
                <InlineBadge className="bg-accent/20 text-accent border-accent/30 ml-2">FIABLE</InlineBadge>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setMassModalOpen(true)}
                size="lg"
                variant="outline"
                className="gap-3 text-lg px-8 py-6 border-primary/30"
              >
                <Zap className="w-6 h-6" />
                Génération Massive
                <InlineBadge className="bg-cosmic-gold/20 text-cosmic-gold border-cosmic-gold/30 ml-2">RAPIDE</InlineBadge>
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Single creation cards */}
        <section className="mb-12">
          <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xl font-semibold mb-6 text-center">
            Ou créez élément par élément
          </motion.h3>
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {creationTypes.map((item) => (
              <motion.div key={item.type} variants={itemVariants}>
                <GenerationCard title={item.title} description={item.description} icon={item.icon} onClick={() => handleOpenModal(item.type)} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Saved Universes */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Vos Univers Sauvegardés ({savedUniverses.length})
          </h3>
          <SavedUniversesViewer universes={savedUniverses} isLoading={isLoadingSaved} onDelete={handleDeleteUniverse} />
        </motion.section>

        {/* Recently Generated (session) */}
        {generatedItems.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-xl font-semibold mb-6">Générations récentes ({generatedItems.length})</h3>
            <div className="space-y-6">
              {generatedItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  {item.type === 'mass' ? (
                    <MassResultsViewer data={item.data} />
                  ) : (
                    <UniverseViewer type={item.type} data={item.data} onExpand={(t, ctx) => handleOpenModal(t as GenerationType, ctx)} />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      <GenerationModal open={modalOpen} onOpenChange={setModalOpen} type={currentType} context={currentContext} onGenerated={handleGenerated} />
      <MassGenerationModal open={massModalOpen} onOpenChange={setMassModalOpen} onGenerated={handleMassGenerated} />
      <StepwiseGenerationModal open={stepwiseModalOpen} onOpenChange={setStepwiseModalOpen} onComplete={() => loadUniverses()} />
    </div>
  );
}

function InlineBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>;
}
