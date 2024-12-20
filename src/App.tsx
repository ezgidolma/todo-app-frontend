import {  Routes, Route, Navigate, Outlet, BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext'; // AuthContext bileşenleri
import LoginPage from './components/LoginPage'; // LoginPage
import RegisterPage from './components/RegisterPage'; // RegisterPage
import { Sidebar } from './components/Sidebar'; // Sidebar
import { Navbar } from './components/Navbar'; // Navbar
import { BoardDetail } from './components/BoardDetail';

// Ana düzen bileşeni: Navbar ve Sidebar yalnızca kimlik doğrulama yapılmış kullanıcılar için
const AuthenticatedLayout = () => {
  return (
    <>
      <Navbar />
      <div className="main-container">
        <Sidebar />
        <div className="main-content">
          <Outlet /> {/* İç içe geçmiş rotaları göstermek için */}
        </div>
      </div>
    </>
  );
};

// Ana rota bileşeni
const AppRoutes = () => {
  const { user } = useAuth(); // Kullanıcı bilgisi

  if (user === undefined) {
    // Kullanıcı bilgisi yükleniyorsa
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Giriş ve kayıt sayfaları */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />

      {/* Kimlik doğrulaması yapılmış kullanıcılar */}
      <Route element={user ? <AuthenticatedLayout /> : <Navigate to="/login" />}>
        <Route path="/" element={<h1>Home Page</h1>} /> {/* Ana sayfa */}
        <Route path="/settings" element={<h1>Settings Page</h1>} /> {/* Ayarlar */}
        <Route path="/favorites" element={<h1>Favorites Page</h1>} /> {/* Favoriler */}
        <Route path="/boards" element={<h1>Boards Page</h1>} /> {/* Boards */}
        <Route path="/board" element={<h1>Main Boards Page</h1>} /> {/* Boards */}
        <Route path="/home" element={<h1>Home Page</h1>} /> {/* Boards */}
        <Route path="/boards/:boardId" element={<BoardDetail />} />
      </Route>

      {/* Bilinmeyen rotalar */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
