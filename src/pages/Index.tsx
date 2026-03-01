import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { StarField } from '@/components/StarField';
import { GenerationCard } from '@/components/GenerationCard';
import { GenerationModal } from '@/components/GenerationModal';
import { UniverseViewer } from '@/components/UniverseViewer';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Globe, 
  Mountain, 
  Crown, 
  Users, 
  Home, 
  LogOut, 
  Loader2,
  Orbit
} from 'lucide-react';
import { toast } from 'sonner';

type GenerationType = 'universe' | 'galaxy' | 'planet' | 'continent' | 'nation' | 'race' | 'family';

interface GeneratedItem {
  type: GenerationType;
  data: Record<string, unknown>;
}

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState<GenerationType>('universe');
  const [currentContext, setCurrentContext] = useState<Record<string, unknown> | undefined>();
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleOpenModal = (type: GenerationType, context?: Record<string, unknown>) => {
    setCurrentType(type);
    setCurrentContext(context);
    setModalOpen(true);
  };

  const handleGenerated = (data: Record<string, unknown>) => {
    setGeneratedItems(prev => [...prev, { type: currentType, data }]);
    toast.success(`${currentType} créé avec succès !`);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Déconnexion réussie');
  };

  const creationTypes: { type: GenerationType; title: string; description: string; icon: React.ReactNode }[] = [
    { type: 'universe', title: 'Univers', description: 'Créer un univers ou multivers complet', icon: <Sparkles className="w-8 h-8 text-primary" /> },
    { type: 'galaxy', title: 'Galaxie', description: 'Générer une galaxie avec son histoire', icon: <Orbit className="w-8 h-8 text-secondary" /> },
    { type: 'planet', title: 'Planète', description: 'Créer une planète détaillée', icon: <Globe className="w-8 h-8 text-cosmic-blue" /> },
    { type: 'continent', title: 'Continent', description: 'Générer un continent avec sa géographie', icon: <Mountain className="w-8 h-8 text-cosmic-gold" /> },
    { type: 'nation', title: 'Nation', description: 'Créer un empire ou royaume', icon: <Crown className="w-8 h-8 text-cosmic-pink" /> },
    { type: 'race', title: 'Race', description: 'Générer une espèce ou race', icon: <Users className="w-8 h-8 text-accent" /> },
    { type: 'family', title: 'Famille', description: 'Créer une lignée noble', icon: <Home className="w-8 h-8 text-primary" /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="min-h-screen cosmic-bg relative overflow-hidden">
      <StarField />
      
      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
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
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display glow-text mb-4">
            Créez des Univers Entiers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Générez des galaxies, planètes, nations, races et familles nobles avec une richesse de détails 
            comparable à Tolkien ou George R.R. Martin. L'IA crée tout pour vous.
          </p>
        </motion.section>

        {/* Creation Cards */}
        <section className="mb-12">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-semibold mb-6 text-center"
          >
            Que voulez-vous créer ?
          </motion.h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {creationTypes.map((item) => (
              <motion.div key={item.type} variants={itemVariants}>
                <GenerationCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  onClick={() => handleOpenModal(item.type)}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Generated Items */}
        {generatedItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-6">Vos Créations</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {generatedItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <UniverseViewer
                    type={item.type}
                    data={item.data}
                    onExpand={(nextType, context) => handleOpenModal(nextType as GenerationType, context)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      {/* Generation Modal */}
      <GenerationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        type={currentType}
        context={currentContext}
        onGenerated={handleGenerated}
      />
    </div>
  );
}
