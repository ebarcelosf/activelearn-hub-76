import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Trophy, Lightbulb, Search, Rocket, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '@/utils/auth';

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { login, register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateLoginForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!loginForm.email) {
      errors.email = 'Email é obrigatório';
    } else if (!validateEmail(loginForm.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!loginForm.password) {
      errors.password = 'Senha é obrigatória';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!registerForm.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (registerForm.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!registerForm.email) {
      errors.email = 'Email é obrigatório';
    } else if (!validateEmail(registerForm.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!registerForm.password) {
      errors.password = 'Senha é obrigatória';
    } else {
      const passwordValidation = validatePassword(registerForm.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0];
      }
    }
    
    if (!registerForm.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateLoginForm()) return;
    
    const success = await login({ email: loginForm.email, password: loginForm.password });
    if (success) {
      navigate('/');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateRegisterForm()) return;
    
    const success = await register(registerForm);
    if (success) {
      navigate('/');
    }
  };

  const handleTabChange = () => {
    clearError();
    setValidationErrors({});
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:flex-1 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <motion.div 
          className="relative z-10 flex flex-col justify-center px-12 text-white"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white/20 rounded-lg p-3">
                <Trophy className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold">ActiveLearn Hub</h1>
            </motion.div>
            
            <motion.p 
              className="text-xl text-white/90 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Transforme desafios em oportunidades de aprendizagem através da metodologia CBL
            </motion.p>
          </div>

          <motion.div 
            className="space-y-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-lg p-2">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Engage</h3>
                <p className="text-white/80 text-sm">Defina problemas e desafios relevantes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-lg p-2">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Investigate</h3>
                <p className="text-white/80 text-sm">Pesquise e analise informações profundamente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-lg p-2">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Act</h3>
                <p className="text-white/80 text-sm">Desenvolva e implemente soluções inovadoras</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          className="w-full max-w-md"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="card-elevated">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
                <div className="gradient-primary rounded-lg p-2">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">ActiveLearn Hub</span>
              </div>
              <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
              <CardDescription>
                Entre ou crie sua conta para começar sua jornada de aprendizagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Cadastrar</TabsTrigger>
                </TabsList>
                
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isLoading}
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-destructive">{validationErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {validationErrors.password && (
                        <p className="text-sm text-destructive">{validationErrors.password}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-primary text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isLoading}
                      />
                      {validationErrors.name && (
                        <p className="text-sm text-destructive">{validationErrors.name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isLoading}
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-destructive">{validationErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {validationErrors.password && (
                        <p className="text-sm text-destructive">{validationErrors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirmar senha</Label>
                      <Input
                        id="register-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={isLoading}
                      />
                      {validationErrors.confirmPassword && (
                        <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-primary text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        'Criar conta'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};