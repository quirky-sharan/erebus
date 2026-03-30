import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  ShieldCheck, 
  Zap, 
  FileText, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SidebarItem = ({ icon: Icon, label, path, active, collapsed, onClick }) => {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={() => onClick(path)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${
        active 
        ? 'bg-cobalt/10 text-cobalt border border-cobalt/20 shadow-[0_0_15px_rgba(46,91,255,0.1)]' 
        : 'text-text-dimmed hover:text-white hover:bg-white/[0.03]'
      }`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-cobalt' : 'text-text-dimmed'}`} />
      {!collapsed && (
        <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
          {label}
        </span>
      )}
      {active && !collapsed && (
        <motion.div 
          layoutId="active-indicator"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-cobalt shadow-[0_0_8px_rgba(46,91,255,0.8)]"
        />
      )}
    </motion.button>
  );
};

export const Sidebar = () => {
    const [collapsed, setCollapsed] = React.useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // System Health State
    const [isOnline, setIsOnline] = React.useState(true);
    const [lastSync, setLastSync] = React.useState(new Date().toLocaleTimeString());

    React.useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch('http://localhost:8000/health');
                if (res.ok) {
                    setIsOnline(true);
                    setLastSync(new Date().toLocaleTimeString());
                } else {
                    setIsOnline(false);
                }
            } catch (err) {
                setIsOnline(false);
            }
        };
        const interval = setInterval(checkHealth, 30000);
        checkHealth();
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Control Center', path: '/dashboard' },
        { icon: Search, label: 'Orbital Search', path: '/search' },
        { icon: ShieldCheck, label: 'Compliance', path: '/compliance' },
        { icon: Zap, label: 'Deorbit Prediction', path: '/deorbit' },
        { icon: Database, label: 'Debris Analysis', path: '/debris' },
        { icon: FileText, label: 'Mission Reports', path: '/report' },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 88 : 280 }}
            className="fixed left-0 top-0 h-screen glass border-r border-white/5 z-50 flex flex-col pt-8 pb-6 px-4"
        >
            <div className="flex items-center gap-3 px-3 mb-10 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-cobalt flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(46,91,255,0.3)]">
                    <Zap className="w-6 h-6 text-white" />
                </div>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-display font-black text-xl tracking-tighter text-white"
                    >
                        ORBIT<span className="text-cobalt">LEX</span>
                    </motion.div>
                )}
            </div>

            <div className="flex-1 space-y-1">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.path}
                        {...item}
                        active={location.pathname === item.path}
                        collapsed={collapsed}
                        onClick={navigate}
                    />
                ))}
            </div>

            <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                {/* Health Indicator */}
                <div className={`px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 ${collapsed ? 'flex justify-center' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                        {!collapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {isOnline ? 'System Operational' : 'Node Offline'}
                                </p>
                                <p className="text-[8px] text-text-dimmed font-mono uppercase truncate opacity-50">
                                    Last Sync: {lastSync}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`flex items-center gap-3 px-3 mt-4 ${collapsed ? 'justify-center' : ''}`}>
                    <img 
                        src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Orbit"} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-xl border border-white/10 bg-void shadow-lg"
                    />
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">
                                {user?.displayName || 'Commander'}
                            </p>
                            <p className="text-[10px] text-text-dimmed uppercase font-black tracking-widest opacity-60">
                                Rank: O-4
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <SidebarItem
                        icon={Settings}
                        label="Settings"
                        path="/settings"
                        active={location.pathname === '/settings'}
                        collapsed={collapsed}
                        onClick={() => {}}
                    />
                    <SidebarItem
                        icon={LogOut}
                        label="System Sign Out"
                        path="/logout"
                        active={false}
                        collapsed={collapsed}
                        onClick={logout}
                    />
                </div>
            </div>

            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-32 w-6 h-6 rounded-full bg-void border border-white/10 flex items-center justify-center text-text-dimmed hover:text-white hover:border-cobalt/40 transition-all shadow-xl"
            >
                {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
        </motion.aside>
    );
};
