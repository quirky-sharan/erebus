import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { ShieldCheck, Zap, BarChart3, Database, Key, ArrowRight } from 'lucide-react';

const FeaturePill = ({ icon: Icon, text, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
    className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl text-text-dimmed text-[10px] font-black uppercase tracking-widest"
  >
    <Icon className="w-3.5 h-3.5 text-cobalt" />
    {text}
  </motion.div>
);

const SignUp = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const features = [
      { icon: Database, text: 'Metadata Index' },
      { icon: ShieldCheck, text: 'Policy Grounding' },
      { icon: Zap, text: 'Decay Simulation' },
      { icon: BarChart3, text: 'Risk Intelligence' }
    ];

    return (
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-void">
            <StarfieldCanvas />
            
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 glass p-10 md:p-20 rounded-[3.5rem] max-w-3xl w-full mx-4 overflow-hidden rim-highlight"
            >
                {/* Subtle Header Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-64 bg-gradient-to-b from-cobalt/5 to-transparent blur-3xl pointer-events-none"></div>

                <div className="text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-void/50 text-cobalt border border-cobalt/20 px-5 py-2 rounded-full text-[10px] font-black tracking-[0.3em] uppercase mb-10 shadow-inner"
                    >
                        <Key className="w-3.5 h-3.5" /> Authentication Protocol: Verified
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter"
                    >
                        Welcome, <span className="text-cobalt">{user?.displayName?.split(' ')[0] || 'Commander'}</span>
                    </motion.h1>

                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, type: "spring", damping: 15 }}
                        className="relative w-32 h-32 mx-auto mb-12"
                    >
                        <div className="absolute inset-0 rounded-full bg-cobalt/10 blur-2xl animate-pulse"></div>
                        <img 
                            src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Orbit"} 
                            alt="Profile" 
                            className="relative z-10 w-32 h-32 rounded-full border-4 border-void p-1 bg-void shadow-2xl"
                        />
                        <div className="absolute -bottom-2 -right-2 z-20 bg-green-500 w-10 h-10 rounded-full border-4 border-card flex items-center justify-center shadow-lg">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="text-text-dimmed text-lg mb-12 max-w-md mx-auto leading-relaxed font-medium"
                    >
                        Identity confirmed via encrypted telemetry bond. Accessing the global orbital intelligence layer and mission archives.
                    </motion.p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
                        {features.map((f, i) => (
                            <FeaturePill key={i} icon={f.icon} text={f.text} index={i} />
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-white text-void font-black py-6 rounded-2xl text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-glow-white/10 hover:shadow-glow-white/20 transition-all duration-500"
                    >
                        Establish System Link
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>
            </motion.div>

            {/* Matrix-like subtle grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>
    );
};

export default SignUp;
