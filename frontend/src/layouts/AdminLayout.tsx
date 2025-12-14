import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
