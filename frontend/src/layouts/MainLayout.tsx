import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const hideHeader = isLandingPage;
  const hideFooter = location.pathname === '/chat' || isLandingPage;

  return (
    <div className="main-layout">
      {!hideHeader && <Header />}
      <main className="main-content">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
