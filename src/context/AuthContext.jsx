import { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../utils/constants';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifikasi token saat app muat
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('bjurnal_token');
      if (token) {
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Failed to authenticate token:', error);
          localStorage.removeItem('bjurnal_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (nomorInduk, password) => {
    try {
      const data = await authApi.login({ nomorInduk, password });
      setUser(data);
      localStorage.setItem('bjurnal_token', data.token);
      return { success: true, user: data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Gagal login. Periksa kembali koneksi Anda.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);
      
      if (data.isApproved === false) {
        return { 
          success: true, 
          user: data, 
          message: data.message || 'Registrasi berhasil. Menunggu persetujuan admin.' 
        };
      }

      setUser(data);
      localStorage.setItem('bjurnal_token', data.token);
      return { success: true, user: data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Gagal registrasi.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bjurnal_token');
  };

  const updateProfile = async (updates) => {
    try {
      const result = await authApi.updateProfile(updates);
      setUser(result);
      if (result.token) {
        localStorage.setItem('bjurnal_token', result.token);
      }
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal memperbarui profil';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
