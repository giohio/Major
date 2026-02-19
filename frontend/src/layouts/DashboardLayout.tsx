import { Outlet } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <UserSidebar />
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
