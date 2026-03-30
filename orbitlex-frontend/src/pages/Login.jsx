import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { ShieldCheck, LogIn } from 'lucide-react';

const Earth = () => {
    const meshRef = useRef();
    const atmosphereRef = useRef();
    
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.0015;
        }
    });

    return (
        <group scale={[2.4, 2.4, 2.4]} position={[0, 0, 0]}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    color="#020617"
                    emissive="#2563EB"
                    emissiveIntensity={0.15}
                    wireframe={true}
                    transparent
                    opacity={0.3}
                />
            </mesh>
            <mesh ref={atmosphereRef}>
                <sphereGeometry args={[1.05, 64, 64]} />
                <meshBasicMaterial
                    color="#1E293B"
                    transparent
                    opacity={0.05}
                    side={THREE.BackSide}
                />
            </mesh>
            {/* Minimal Orbits */}
            {[1.3, 1.6].map((radius, i) => (
                <group key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
                    <mesh>
                        <torusGeometry args={[radius, 0.0005, 16, 120]} />
                        <meshBasicMaterial color="#334155" transparent opacity={0.2} />
                    </mesh>
                    <motion.group 
                        animate={{ rotateZ: 360 }} 
                        transition={{ duration: 15 + i * 10, repeat: Infinity, ease: "linear" }}
                    >
                        <mesh position={[radius, 0, 0]}>
                            <sphereGeometry args={[0.01, 16, 16]} />
                            <meshBasicMaterial color="#64748b" />
                        </mesh>
                    </motion.group>
                </group>
            ))}
        </group>
    );
};

const Login = () => {
    const { user, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (error) {
            console.error("Authentication protocol failed", error);
        }
    };

    if (user) return <Navigate to="/dashboard" />;

    const logoText = "ORBITLEX";

    return (
        <div className="relative min-h-screen overflow-hidden flex items-center bg-void">
            <StarfieldCanvas />
            
            <div className="container mx-auto px-8 z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-xl"
                >
                    <div className="mb-10">
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-cobalt/10 border border-cobalt/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.3em] text-cobalt uppercase inline-flex items-center gap-2 mb-8 shadow-inner"
                        >
                            <ShieldCheck className="w-3 h-3" /> Secure Node Access • Encryption Protocol Active
                        </motion.div>
                        <div className="flex flex-wrap items-baseline gap-1">
                            {logoText.split("").map((char, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        delay: index * 0.04, 
                                        duration: 0.8, 
                                        ease: "easeOut"
                                    }}
                                    className="font-bold text-7xl md:text-8xl tracking-tighter text-white"
                                >
                                    {char}
                                </motion.span>
                            ))}
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="w-4 h-4 bg-cobalt rounded-full ml-2 mb-2 animate-pulse"
                            />
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                    >
                        <p className="text-text-dimmed text-lg md:text-xl font-medium mb-12 max-w-md leading-relaxed">
                            Establishing high-fidelity orbital awareness and automated regulatory compliance for the <span className="text-white font-bold tracking-tight">next generation</span> of aerospace operations.
                        </p>
                        
                        <div className="flex flex-col gap-5 max-w-sm">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogin}
                                className="flex items-center justify-center gap-5 bg-white text-void px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-glow-white/10 hover:shadow-glow-white/20 transition-all duration-500"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                                Initialize Connection
                            </motion.button>
                            
                            <p className="text-[9px] font-black text-text-dimmed/40 uppercase tracking-widest text-center">
                                Federated Protocol • Single Sign-On
                            </p>
                        </div>

                        <div className="mt-12 flex items-center gap-6 text-text-dimmed/30 text-[9px] font-bold uppercase tracking-[0.2em] pt-8 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-cobalt/50 animate-pulse"></div>
                                Telemetry: Online
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-cobalt/50 animate-pulse"></div>
                                AI Engine: Nominal
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <div className="hidden md:block h-[600px] w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-void via-transparent to-transparent z-10 pointer-events-none" />
                    <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
                        <ambientLight intensity={0.2} />
                        <pointLight position={[10, 10, 10]} intensity={1.5} color="#2563EB" />
                        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#1E293B" />
                        <Earth />
                    </Canvas>
                </div>
            </div>

            {/* Subtle background nodes */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                 <div className="absolute top-1/4 left-1/4 w-px h-64 bg-gradient-to-b from-transparent via-cobalt/20 to-transparent" />
                 <div className="absolute bottom-1/4 right-1/4 w-px h-64 bg-gradient-to-b from-transparent via-cobalt/20 to-transparent" />
            </div>
        </div>
    );
};

export default Login;
