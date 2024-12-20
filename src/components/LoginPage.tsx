import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router'dan useNavigate fonksiyonunu import ediyoruz
import { useAuth } from './AuthContext'; // AuthContext'ten login fonksiyonunu alıyoruz
import { Link } from 'react-router-dom'; // Link bileşeni, sayfalar arası gezinme için kullanılıyor
import '../styles/Login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');  // Kullanıcının girdiği email'i tutan state
  const [password, setPassword] = useState('');  // Kullanıcının girdiği şifreyi tutan state
  const navigate = useNavigate();  // Sayfa yönlendirmesi için navigate fonksiyonunu alıyoruz
  const { login } = useAuth();  // AuthContext'ten login fonksiyonunu alıyoruz

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Formun default davranışını engelliyoruz (sayfa yenilemesini engeller)

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    const user = { email, password };  // Kullanıcı bilgilerini bir obje olarak oluşturuyoruz

    try {
      await login(user);  // AuthContext'ten aldığımız login fonksiyonunu çağırıyoruz
      navigate('/home');  // Başarılı girişten sonra anasayfaya yönlendiriyoruz
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login to Trello</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
