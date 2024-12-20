import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Link ve useNavigate'i import ediyoruz
import { useAuth } from './AuthContext'; // AuthContext'ten register fonksiyonunu alıyoruz
import '../styles/Register.css'; 

const RegisterPage = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  // Sayfa yönlendirmesi için navigate fonksiyonunu alıyoruz
  const { register } = useAuth(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Formun default davranışını engelliyoruz (sayfa yenilemesini engeller)

    // Temel doğrulama (isteğe bağlı olarak genişletilebilir)
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    const user = { email, password };  // Kullanıcı bilgilerini bir obje olarak oluşturuyoruz

    // AuthContext'ten aldığımız register fonksiyonunu çağırıyoruz
    await register(user);

    // Başarılı kayıt sonrası login sayfasına yönlendiriyoruz
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Create a New Account</h1>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="email"
            placeholder="Email"
            className="register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="register-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="register-button">Register</button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
