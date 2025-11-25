import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import {
  MessageCircle,
  BarChart3,
  Users,
  Calendar,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  AlertCircle,
  User,
  CreditCard,
  Phone,
  Brain
} from 'lucide-react';

const UserSidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/user/profile', icon: User, label: 'Trang cá nhân' },
    { path: '/user/dashboard', icon: BarChart3, label: 'Dashboard cảm xúc' },
    { path: '/chat', icon: MessageCircle, label: 'Chat với AI' },
    { path: '/user/find-doctor', icon: Users, label: 'Tìm bác sĩ' },
    { path: '/user/appointments', icon: Calendar, label: 'Lịch hẹn của tôi' },
    { path: '/user/alert', icon: AlertCircle, label: 'Cảnh báo' },
    { path: '/user/exercises', icon: Heart, label: 'Bài tập' },
    { path: '/user/history', icon: FileText, label: 'Lịch sử' },
    { path: '/user/payments', icon: CreditCard, label: 'Thanh toán' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-primary text-primary-foreground"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/user/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              MindCare AI
            </span>
          </Link>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-200px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
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
            to="/user/settings"
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
          
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <Phone size={16} className="text-destructive mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Khẩn cấp?</h4>
                <p className="text-xs text-muted-foreground">Hotline 24/7</p>
                <a
                  href="tel:1900xxxx"
                  className="text-sm font-bold text-destructive hover:underline"
                >
                  1900-xxxx
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default UserSidebar;
