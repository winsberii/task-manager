import React, { createContext, useContext, useEffect, useState } from 'react';
import { lucia } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/db';
import { hash, verify } from '@node-rs/argon2';

interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const sessionId = getCookie('auth_session');
      if (!sessionId) {
        setLoading(false);
        return;
      }

      const { session, user: sessionUser } = await lucia.validateSession(sessionId);
      if (session && sessionUser) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
          fullName: sessionUser.fullName
        });
        // Store user ID for database operations
        localStorage.setItem('current_user_id', sessionUser.id);
        // Refresh session cookie
        setCookie('auth_session', session.id, {
          expires: session.expiresAt,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      } else {
        // Invalid session, clear cookie
        deleteCookie('auth_session');
        localStorage.removeItem('current_user_id');
      }
    } catch (error) {
      console.error('Session validation error:', error);
      deleteCookie('auth_session');
      localStorage.removeItem('current_user_id');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return { error: { message: 'User already exists' } };
      }

      // Hash password
      const hashedPassword = await hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
      });

      // Create user
      const newUser = await createUser(email, hashedPassword, fullName);
      
      // Create session
      const session = await lucia.createSession(newUser.id, {});
      
      // Set session cookie
      setCookie('auth_session', session.id, {
        expires: session.expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      setUser({
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name
      });

      // Store user ID for database operations
      localStorage.setItem('current_user_id', newUser.id);

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: { message: error.message || 'Failed to create account' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Get user by email
      const user = await getUserByEmail(email);
      if (!user) {
        return { error: { message: 'Invalid email or password' } };
      }

      // Verify password
      const validPassword = await verify(user.hashed_password, password);
      if (!validPassword) {
        return { error: { message: 'Invalid email or password' } };
      }

      // Create session
      const session = await lucia.createSession(user.id, {});
      
      // Set session cookie
      setCookie('auth_session', session.id, {
        expires: session.expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      setUser({
        id: user.id,
        email: user.email,
        fullName: user.full_name
      });

      // Store user ID for database operations
      localStorage.setItem('current_user_id', user.id);

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: { message: error.message || 'Failed to sign in' } };
    }
  };

  const signOut = async () => {
    try {
      const sessionId = getCookie('auth_session');
      if (sessionId) {
        await lucia.invalidateSession(sessionId);
      }
      deleteCookie('auth_session');
      setUser(null);
      localStorage.removeItem('current_user_id');
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: { message: error.message || 'Failed to sign out' } };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Cookie helper functions
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, options: {
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}) {
  let cookieString = `${name}=${value}`;
  
  if (options.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`;
  }
  
  if (options.httpOnly) {
    cookieString += `; HttpOnly`;
  }
  
  if (options.secure) {
    cookieString += `; Secure`;
  }
  
  if (options.sameSite) {
    cookieString += `; SameSite=${options.sameSite}`;
  }
  
  document.cookie = cookieString;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}