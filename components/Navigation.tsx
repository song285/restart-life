
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', icon: 'home', path: '/', label: '首页' },
    { id: 'stats', icon: 'analytics', path: '/stats', label: '统计' },
    { id: 'settings', icon: 'settings', path: '/settings', label: '设置' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-md mx-auto mb-0 px-6">
        <div className="flex items-center justify-around bg-white/70 backdrop-blur-2xl border border-white rounded-full p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-1 flex-col items-center justify-center h-14 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'fill-icon' : ''}`}>
                  {item.icon}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-4 bg-transparent"></div>
    </nav>
  );
};

export default Navigation;
