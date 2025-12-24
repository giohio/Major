import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../hooks/useAuth';
import { getAvatarUrl } from '../utils/avatar';
import {
  LayoutDashboard,
  Users,
  Calendar,
  AlertCircle,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Brain
} from 'lucide-react';

const DoctorSidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menuItems = [
    { path: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/doctor/patients', icon: Users, label: 'Bệnh nhân' },
    { path: '/doctor/appointments', icon: Calendar, label: 'Lịch hẹn' },
    { path: '/doctor/alerts', icon: AlertCircle, label: 'Cảnh báo' },
    { path: '/doctor/library', icon: BookOpen, label: 'Thư viện' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-primary text-primary-foreground"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/doctor/dashboard" className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-sidebar-border">
              <AvatarImage src={getAvatarUrl(user?.avatar_url)} alt={user?.full_name || 'Doctor'} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">
                {user?.full_name?.charAt(0).toUpperCase() || 'D'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-semibold text-sidebar-foreground">
                {user?.full_name || 'Doctor'}
              </div>
              <div className="text-xs text-sidebar-foreground/60">
                Bác sĩ
              </div>
            </div>
          </Link>
        </div>

        <div className="px-4 py-3 border-b border-sidebar-border">
          <Link to="/doctor/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              MindCare AI
            </span>
          </Link>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                onClick={() => setOpen(false)}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border space-y-2">
          <Link
            to="/doctor/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <Settings size={20} />
            <span className="font-medium">Cài đặt</span>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default DoctorSidebar;
