import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, User, LogOut, Search, Activity, FileText, Settings, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Search', path: '/search', icon: Search },
        { name: 'Deorbit', path: '/deorbit', icon: Activity },
        { name: 'Debris', path: '/debris', icon: Box },
        { name: 'Report', path: '/report', icon: FileText },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 glass border-b border-cyan/20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="w-8 h-8 bg-cyan rounded-lg flex items-center justify-center">
                    <Rocket className="text-void w-5 h-5" />
                </div>
                <h1 className="font-display text-2xl font-bold tracking-wider text-white">ORBITLEX</h1>
            </div>

            <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) => 
                            `relative py-2 text-sm font-medium transition-colors ${
                                isActive ? 'text-cyan' : 'text-text-muted hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {link.name}
                                {isActive && (
                                    <motion.div 
                                        layoutId="nav-underline"
                                        className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-void/50 px-3 py-1.5 rounded-full border border-cyan/10">
                    <img 
                        src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Orbit"} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full"
                    />
                    <span className="text-xs font-mono text-cyan hidden lg:block">
                        {user?.displayName?.split(' ')[0] || 'Commander'}
                    </span>
                    <button 
                        onClick={() => signOut()}
                        className="text-text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-full transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

// Re-using Rocket icon from Lucide
import { Rocket } from 'lucide-react';
