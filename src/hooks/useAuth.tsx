import { useState, useEffect, createContext, useContext } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Profile {
  _id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  role: 'ADVERTISER' | 'OWNER';
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: string, phone?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, phone?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; bio?: string; avatarUrl?: string }) => Promise<{ error: any }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and fetch user profile
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      setUser(response.user);
      setProfile(response.user.profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Clear invalid token
      apiClient.setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    role: string,
    phone?: string
  ) => {
    try {
      const response = await apiClient.register({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: role as 'ADVERTISER' | 'OWNER'
      });

      // Set token and user data
      apiClient.setToken(response.token);
      setUser(response.user);
      setProfile(response.user.profile);
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signIn = async (email: string, password: string, phone?: string) => {
    try {
      const response = await apiClient.login(email, password, phone);

      // Set token and user data
      apiClient.setToken(response.token);
      setUser(response.user);
      setProfile(response.user.profile);
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state
      setUser(null);
      setProfile(null);
      
      // Clear token
      apiClient.setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      
      // Redirect to homepage
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Still redirect even if there's an error
      window.location.href = '/';
    }
  };

  const updateProfile = async (data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
  }) => {
    try {
      const response = await apiClient.updateProfile(data);
      setProfile(response.profile);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await apiClient.changePassword({ currentPassword, newPassword });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};