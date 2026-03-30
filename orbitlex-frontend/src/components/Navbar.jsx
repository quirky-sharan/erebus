import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, LogOut, Search, Activity, FileText, LayoutDashboard, Rocket, Recycle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const navLinks = [
        { name: 'Control', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Repository', path: '/search', icon: Search },
        { name: 'Risk', path: '/debris', icon: Box },
        { name: 'Compliance', path: '/compliance', icon: ShieldCheck },
        { name: 'Telemetry', path: '/deorbit', icon: Activity },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 pointer-events-none">
            <div className="max-w-7xl mx-auto px-8 py-6">
                <div className="glass px-8 py-4 rounded-[2rem] flex items-center justify-between shadow-2xl rim-highlight pointer-events-auto">
                    <div 
                        className="flex items-center gap-4 cursor-pointer group" 
                        onClick={() => navigate('/dashboard')}
                    >
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-cobalt/20 transition-all duration-500">
                            <Rocket className="text-white w-5 h-5 group-hover:scale-110 transition-transform" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tighter text-white">
                            ORBIT<span className="text-cobalt">LEX</span>
                        </h1>
                    </div>

                    <div className="hidden lg:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) => 
                                    `relative px-5 py-2 text-[10px] font-black transition-all duration-300 tracking-widest uppercase rounded-xl ${
                                        isActive ? 'text-white bg-white/5' : 'text-text-dimmed hover:text-white hover:bg-white/[0.02]'
                                    }`
                                }
                            >
                                <div className="flex items-center gap-2">
                                    <link.icon className="w-3 h-3" />
                                    <span>{link.name}</span>
                                </div>
                            </NavLink>
                        ))}
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-4 bg-void/40 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/5 hover:border-cobalt/20 transition-all duration-500 group">
                            <div className="relative">
                                <img 
                                    src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Orbit"} 
                                    alt="Profile" 
                                    className="w-8 h-8 rounded-full border border-white/10 grayscale group-hover:grayscale-0 transition-all"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-void shadow-sm animate-pulse"></div>
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-[8px] font-black text-cobalt uppercase leading-none mb-1 tracking-widest">Authenticated</span>
                                <span className="text-[11px] font-bold text-white leading-none tracking-tight">
                                    {user?.displayName?.split(' ')[0] || 'Commander'}
                                </span>
                            </div>
                            <div className="w-px h-6 bg-white/5 mx-1"></div>
                            <button 
                                onClick={() => signOut()}
                                className="text-text-dimmed hover:text-white transition-colors"
                                title="Terminate Session"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};


