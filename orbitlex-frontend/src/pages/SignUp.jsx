import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { Rocket, ShieldCheck, Globe, Zap, BarChart3, Database } from 'lucide-react';

const FeaturePill = ({ icon: Icon, text, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
    className="flex items-center gap-2 bg-cyan/10 border border-cyan/20 px-4 py-2 rounded-full text-cyan text-sm"
  >
    <Icon className="w-4 h-4" />
    {text}
  </motion.div>
);

const SignUp = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // In a real app, logic would detect if it's the first login
    // For now, we just show this welcome screen as the sign-up flow

    const features = [
      { icon: Database, text: 'Live Satellite Data' },
      { icon: ShieldCheck, text: 'AI Compliance Engine' },
      { icon: Zap, text: 'Deorbit Predictor' },
      { icon: BarChart3, text: 'Debris Simulation' }
    ];

    return (
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
            <StarfieldCanvas />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 glass p-8 md:p-12 rounded-3xl max-w-2xl w-full mx-4 overflow-hidden"
            >
                {/* Background SVG paths */}
                <svg className="absolute top-0 left-0 w-full h-full -z-10 opacity-20 pointer-events-none">
                  <motion.path
                    d="M-100,300 Q200,100 800,400"
                    fill="none"
                    stroke="cyan"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </svg>

                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block bg-cyan/20 text-cyan px-3 py-1 rounded-full text-xs font-bold mb-6"
                    >
                        STEP 1: INITIALIZATION
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                        Welcome to OrbitLex, <span className="text-cyan">{user?.displayName || 'Commander'}</span>
                    </motion.h1>

                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="relative w-24 h-24 mx-auto mb-8"
                    >
                        <img 
                            src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Orbit"} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full border-2 border-cyan p-1"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-card flex items-center justify-center">
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }} 
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-2 h-2 bg-white rounded-full"
                            />
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-text-muted text-lg mb-10 max-w-md mx-auto"
                    >
                        OrbitLex provides the orbital intelligence you need for mission compliance and space debris mitigation.
                    </motion.p>

                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {features.map((f, i) => (
                            <FeaturePill key={i} icon={f.icon} text={f.text} index={i} />
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0, 194, 255, 0.5)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-gradient-to-r from-cyan to-orbit text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-3"
                    >
                        <Rocket className="w-5 h-5" />
                        Begin Mission
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUp;
