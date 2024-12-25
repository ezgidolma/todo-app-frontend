import { Routes, Route, Navigate  } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext'; // AuthContext bileşenleri
import LoginPage from './components/LoginPage'; // LoginPage
import RegisterPage from './components/RegisterPage'; // RegisterPage
import Main from './components/Main'; // Sidebar
import Navbar from './components/Navbar';
import './styles/App.css';
import { WorkspaceProvider } from './components/context/WorkspaceContext';


// Ana düzen bileşeni: Navbar ve Sidebar yalnızca kimlik doğrulama yapılmış kullanıcılar için
const AuthenticatedLayout = () => {

  return (
    <>
      <Navbar />
      <div className="app-layout">
        {/* Sidebar her durumda görünsün */}
        
        <div className="main-container">
          <Main></Main>
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
      <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/home" /> : <RegisterPage />} />

      {/* Kimlik doğrulaması yapılmış kullanıcılar */}
      <Route element={user ? <AuthenticatedLayout /> : <Navigate to="/login" />}>
        <Route path="/" element={<div />}/> {/* Ana sayfa */}
        <Route path="/settings" /> {/* Ayarlar */}
        <Route path="/favorites" element={<div />} /> {/* Favoriler */}
        <Route path="/boards" element={<div />} />  {/* Boards */}
        <Route path="/board" element={<div />} /> {/* Boards */}
        <Route path="/home" element={<div />} /> {/* Boards */}
        <Route path="/boards/:boardId" element={<Main />} />
      </Route>

      {/* Bilinmeyen rotalar */}
      <Route path="*" element={<Navigate to={user ? "/home" : "/login"} />} />
    </Routes>
  );
};

const App = () => {
  return (
    <WorkspaceProvider>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
    </WorkspaceProvider>
  );
};

export default App;
