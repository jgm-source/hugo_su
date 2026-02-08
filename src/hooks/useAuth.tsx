import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  senha: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: null; // Mantido para compatibilidade
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateUser: (data: Partial<User>) => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário no localStorage ao carregar
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Buscar usuário por email na tabela Client_login
      const { data: userData, error } = await supabase
        .from('Client_login')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !userData) {
        return { error: new Error('Email ou senha inválidos') };
      }

      // Verificar senha
      if (password !== userData.senha) {
        return { error: new Error('Email ou senha inválidos') };
      }

      // Remover senha do objeto antes de salvar
      const { senha: _, ...userWithoutPassword } = userData;
      
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Erro ao fazer login') };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('Client_login')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { error: new Error('Email já cadastrado') };
      }

      // Inserir novo usuário
      const { data, error } = await supabase
        .from('Client_login')
        .insert({
          email,
          senha: password
        })
        .select()
        .single();

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Erro ao criar conta') };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const resetPassword = async (email: string) => {
    // TODO: Implementar recuperação de senha
    return { error: new Error('Funcionalidade em desenvolvimento') };
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) {
      return { error: new Error('Usuário não autenticado') };
    }

    try {
      const { error } = await supabase
        .from('Client_login')
        .update(data)
        .eq('id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Erro ao atualizar usuário') };
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const { data: userData, error } = await supabase
        .from('Client_login')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !userData) {
        console.error('Erro ao recarregar usuário:', error);
        return;
      }

      // Remover senha do objeto antes de salvar
      const { senha: _, ...userWithoutPassword } = userData;
      
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    } catch (error: any) {
      console.error('Erro ao recarregar usuário:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session: null, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword,
      updateUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}