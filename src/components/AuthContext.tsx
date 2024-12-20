import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  email: string;
  password: string;
  role?: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;  // Kullanıcı bilgisini tutacak state
  login: (user: { email: string; password: string }) => Promise<void>;  // Giriş yapmak için fonksiyon
  logout: () => void;  // Çıkış yapmak için fonksiyon
  register: (user: { email: string; password: string }) => Promise<void>;  // Kayıt olmak için fonksiyon
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);  // AuthContext'i oluşturuyoruz

interface AuthProviderProps {
  children: ReactNode;  // AuthProvider'ın alt bileşenlerini tanımlıyoruz
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);  // Kullanıcı bilgilerini tutan state
  const navigate = useNavigate();  // `useNavigate` burada kullanıyoruz

  useEffect(() => {
    const storedUser = localStorage.getItem('user');  // localStorage'dan kullanıcıyı alıyoruz
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);  // Kullanıcıyı JSON formatında çözümlüyoruz
        if (parsedUser?.email) {
          setUser(parsedUser);  // Geçerli kullanıcıyı state'e atıyoruz
        } else {
          console.error('Invalid user data in localStorage');  // Geçersiz kullanıcı verisi
          localStorage.removeItem('user');  // Geçersiz veriyi localStorage'dan siliyoruz
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);  // JSON çözme hatası
        localStorage.removeItem('user');  // Hata durumunda kullanıcıyı siliyoruz
      }
    }
  }, []);

  const login = async (user: { email: string; password: string }) => {
    const instance = axios.create({
      baseURL: 'http://localhost:3000',
      timeout: 1000, // Opsiyonel: Timeout süresi
    });
  
    try {
      // Login isteği gönderiliyor
      const response = await instance.post('/auth/login', user);
  
      // Access token varsa giriş işlemleri
      if (response.data?.accessToken) {
        const token = response.data.accessToken;
  
        // Token'ı localStorage'a kaydediyoruz
        localStorage.setItem('token', token);
  
        // Kullanıcı bilgilerini ayarlıyoruz
        setUser({ email: user.email, password: user.password });
  
        // İsterseniz sadece email'i saklayabilirsiniz
        localStorage.setItem('user', JSON.stringify({ email: user.email }));
  
        // Giriş başarılı olduğunda ana sayfaya yönlendirme
        navigate('/home');  // `navigate` burada çalışır
      } else {
        // Geçersiz yanıt durumunda hata fırlatılıyor
        throw new Error('Invalid login response data');
      }
    } catch (error: any) {
      console.error('Login failed', error);
  
      // Şifre hatası kontrolü
      if (error.response?.status === 401 && error.response?.data?.message === "Password is incorrect") {
        alert("Password incorrect. Please try again.");
      } else {
        // Genel bir hata mesajı gösterilir
        const errorMessage =
          error.response?.data?.message || 'Login failed. Please check your credentials.';
        alert(errorMessage);
      }
    }
  };

  const logout = () => {  // Çıkış yapmak için kullanılan fonksiyon
    setUser(null);  // Kullanıcıyı null yapıyoruz
    localStorage.removeItem('user');  // Kullanıcıyı localStorage'dan siliyoruz
    localStorage.removeItem('token');  // Token'ı localStorage'dan siliyoruz
    navigate('/login');  // Çıkış yapıldığında login sayfasına yönlendiriyoruz
  };

  const register = async (user: { email: string; password: string }) => {  // Kayıt olmak için kullanılan fonksiyon
    const instance = axios.create({
      baseURL: 'http://localhost:3000',
      timeout: 1000, // İsteğe bağlı
    });
    
    try {
      const response = await instance.post('/auth/register', user); // Kayıt isteği gönderiyoruz
      if (response.status === 201) { // Kayıt başarılıysa
        alert('Registration successful. Please log in.'); // Başarı mesajı gösteriyoruz
      } else {
        throw new Error('Registration failed with an unknown error'); // Hata durumunda
      }
    } catch (error: any) {
      console.error('Registration failed', error); // Kayıt hatası logu
      const errorMessage =
        error.response?.data?.message || 'Registration failed. Please try again.'; // API'den özel hata mesajı
      alert(errorMessage); // Kullanıcıya hata mesajı gösteriyoruz
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}  {/* Alt bileşenleri render ediyoruz */}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {  // useAuth hook'u ile AuthContext'i kullanıyoruz
  const context = useContext(AuthContext);  // AuthContext'i alıyoruz
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');  // Eğer context bulunmazsa hata fırlatıyoruz
  }
  return context;  // context'i döndürüyoruz
};
