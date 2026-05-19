import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconLayoutDashboard, IconFolder, IconListCheck, IconUsers,
  IconSettings, IconBell, IconSearch, IconLogout, IconMenu2, IconX,
} from '@tabler/icons-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { path: '/projects', label: 'Projects', icon: IconFolder },
  { path: '/my-tasks', label: 'My Tasks', icon: IconListCheck },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/my-tasks': 'My Tasks',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const basePath = '/' + location.pathname.split('/')[1];
  const pageTitle = pageTitles[basePath] || 'Projects';

  return (
    <div className="flex h-screen bg-[#0F1117] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] bg-[#0F1117] border-r border-[#2D3248] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-[#2D3248] gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#6366F1] flex items-center justify-center">
            <IconListCheck size={16} className="text-white" />
          </div>
          <span className="font-bold text-base text-[#F1F5F9]">TaskSuite</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#6366F1]/10 text-[#818CF8] border-l-[3px] border-[#6366F1] rounded-l-none'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#22263A]'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-medium uppercase tracking-wider text-[#475569]">Projects</p>
          </div>
          <Link
            to="/projects"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#94A3B8] hover:text-white hover:bg-[#22263A] transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-[#6366F1] flex-shrink-0" />
            All Projects
          </Link>
        </nav>

        {/* User section */}
        <div className="border-t border-[#2D3248] p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center text-sm font-medium text-[#818CF8]">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F1F5F9] truncate">{user?.name}</p>
              <p className="text-xs text-[#475569]">{user?.role}</p>
            </div>
            <button onClick={logout} className="text-[#475569] hover:text-[#EF4444] transition-colors">
              <IconLogout size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-[#2D3248] bg-[#0F1117] flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-[#94A3B8]" onClick={() => setSidebarOpen(true)}>
              <IconMenu2 size={20} />
            </button>
            <h1 className="text-lg font-semibold text-[#F1F5F9]" style={{ letterSpacing: '-0.3px' }}>
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#22263A] rounded-lg transition-colors relative">
              <IconBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6366F1]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center text-sm font-medium text-[#818CF8]">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
