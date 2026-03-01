import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarField } from '@/components/StarField';
import { Loader2, Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

const emailSchema = z.string().email('Email invalide');
const passwordSchema = z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères');
const usernameSchema = z.string().min(3, 'Le pseudo doit contenir au moins 3 caractères').max(20, 'Le pseudo ne doit pas dépasser 20 caractères').regex(/^[a-zA-Z0-9_]+$/, 'Le pseudo ne peut contenir que des lettres, chiffres et underscores');

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  if (loading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateSignIn = () => {
    try {
      if (email.includes('@')) {
        emailSchema.parse(email);
      } else {
        usernameSchema.parse(email);
      }
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const validateSignUp = () => {
    try {
      usernameSchema.parse(username);
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (password !== confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        return false;
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) return;

    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      if (error.message === 'username_login_not_supported') {
        toast.error('Veuillez utiliser votre email pour vous connecter');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou mot de passe incorrect');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Veuillez confirmer votre email avant de vous connecter');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Connexion réussie !');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUp()) return;

    setIsSubmitting(true);
    const { error } = await signUp(email, password, username);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Cet email est déjà utilisé');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen cosmic-bg relative overflow-hidden">
      <StarField />

      {/* Animated nebula orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px]"
        animate={{ x: [0, 50, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-[100px]"
        animate={{ x: [0, -60, 40, 0], y: [0, 50, -20, 0], scale: [1, 0.8, 1.15, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-cosmic-pink/10 blur-[80px]"
        animate={{ x: [0, 30, -50, 0], y: [0, -60, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Card className="card-cosmic border-primary/30 backdrop-blur-xl">
            <CardHeader className="text-center">
              <motion.div
                className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center"
                animate={{ boxShadow: ['0 0 20px hsl(265 85% 65% / 0.3)', '0 0 40px hsl(265 85% 65% / 0.6)', '0 0 20px hsl(265 85% 65% / 0.3)'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles className="w-10 h-10 text-primary" />
                </motion.div>
              </motion.div>
              <CardTitle className="text-3xl font-display glow-text">
                Universe Creator
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {activeTab === 'signin' ? 'Connectez-vous pour explorer vos mondes' : 'Créez un compte pour bâtir des univers'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); resetForm(); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300">
                    Connexion
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300">
                    Inscription
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="signin" key="signin">
                    <motion.form
                      onSubmit={handleSignIn}
                      className="space-y-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div className="space-y-2" variants={inputVariants}>
                        <Label htmlFor="signin-email" className="flex items-center gap-2 text-foreground/80">
                          <Mail className="w-4 h-4 text-primary" /> Email
                        </Label>
                        <Input
                          id="signin-email"
                          type="text"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-muted/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                          required
                        />
                      </motion.div>
                      <motion.div className="space-y-2" variants={inputVariants}>
                        <Label htmlFor="signin-password" className="flex items-center gap-2 text-foreground/80">
                          <Lock className="w-4 h-4 text-primary" /> Mot de passe
                        </Label>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-muted/50 border-border/50 focus:border-primary/50 pr-10 transition-all duration-300"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full btn-cosmic" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Se connecter'}
                        </Button>
                      </motion.div>
                    </motion.form>
                  </TabsContent>

                  <TabsContent value="signup" key="signup">
                    <motion.form
                      onSubmit={handleSignUp}
                      className="space-y-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div className="space-y-2" variants={inputVariants}>
                        <Label htmlFor="signup-username" className="flex items-center gap-2 text-foreground/80">
                          <User className="w-4 h-4 text-primary" /> Pseudo
                        </Label>
                        <Input
                          id="signup-username"
                          type="text"
                          placeholder="VotreNomDeCreateur"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-muted/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                          required
                        />
                      </motion.div>
                      <motion.div className="space-y-2" variants={inputVariants}>
                        <Label htmlFor="signup-email" className="flex items-center gap-2 text-foreground/80">
                          <Mail className="w-4 h-4 text-primary" /> Email
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-muted/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                          required
                        />
                      </motion.div>
                      <motion.div className="space-y-2" variants={inputVariants}>
                        <Label htmlFor="signup-password" className="flex items-center gap-2 text-foreground/80">
                          <Lock className="w-4 h-4 text-primary" /> Mot de passe
                        </Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-muted/50 border-border/50 focus:border-primary/50 pr-10 transition-all duration-300"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </motion.div>
                      <motion.div className="space-y-2" variants={inputVariants}>
                        <Label htmlFor="signup-confirm-password" className="flex items-center gap-2 text-foreground/80">
                          <Lock className="w-4 h-4 text-primary" /> Confirmer le mot de passe
                        </Label>
                        <div className="relative">
                          <Input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-muted/50 border-border/50 focus:border-primary/50 pr-10 transition-all duration-300"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive"
                          >
                            Les mots de passe ne correspondent pas
                          </motion.p>
                        )}
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full btn-cosmic" disabled={isSubmitting || (!!confirmPassword && password !== confirmPassword)}>
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer un compte'}
                        </Button>
                      </motion.div>
                    </motion.form>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
