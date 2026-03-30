import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { Rocket, ShieldCheck } from 'lucide-react';

const Earth = () => {
    const meshRef = useRef();
    const atmosphereRef = useRef();
    
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.003;
        }
    });

    return (
        <group scale={[2, 2, 2]} position={[1.5, 0, 0]}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color="#0A1628"
                    emissive="#00C2FF"
                    emissiveIntensity={0.1}
                    wireframe={true}
                />
            </mesh>
            <mesh ref={atmosphereRef}>
                <sphereGeometry args={[1.05, 32, 32]} />
                <meshBasicMaterial
                    color="#00C2FF"
                    transparent
                    opacity={0.05}
                    side={THREE.BackSide}
                />
            </mesh>
            {/* Simple orbit circles */}
            <group rotation={[Math.PI / 4, 0, 0]}>
                <mesh>
                    <torusGeometry args={[1.3, 0.002, 16, 100]} />
                    <meshBasicMaterial color="#00C2FF" transparent opacity={0.3} />
                </mesh>
            </group>
            <group rotation={[-Math.PI / 3, 0, 0]}>
                <mesh>
                    <torusGeometry args={[1.6, 0.002, 16, 100]} />
                    <meshBasicMaterial color="#7B5EA7" transparent opacity={0.2} />
                </mesh>
            </group>
        </group>
    );
};

const Login = () => {
    const { user, signInWithGoogle, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    if (user) return <Navigate to="/dashboard" />;

    const logoText = "ORBITLEX";

    return (
        <div className="relative min-h-screen overflow-hidden flex items-center">
            <StarfieldCanvas />
            
            <div className="container mx-auto px-6 z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="max-w-xl"
                >
                    <div className="mb-2">
                        <div className="flex">
                            {logoText.split("").map((char, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        delay: index * 0.05, 
                                        duration: 0.5, 
                                        ease: "easeOut" 
                                    }}
                                    className="font-display text-6xl md:text-8xl font-bold tracking-[0.15em] text-white"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                    >
                        <p className="text-cyan text-xl md:text-2xl font-display mb-8">
                            Mission Compliance. Orbital Intelligence.
                        </p>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: 200 }}
                            transition={{ delay: 1.5, duration: 0.6, ease: "easeInOut" }}
                            className="h-px bg-cyan mb-12"
                        />
                        
                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(0, 194, 255, 0.4)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleLogin}
                            className="flex items-center justify-center gap-4 bg-white text-void px-8 py-4 rounded-xl font-bold text-lg w-72 transition-all"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                            Continue with Google
                        </motion.button>

                        <div className="mt-6 flex items-center gap-2 text-text-muted text-xs opacity-60">
                            <ShieldCheck className="w-4 h-4" />
                            Protected by Firebase Authentication
                        </div>
                    </motion.div>
                </motion.div>

                <div className="hidden md:block h-[600px] w-full">
                    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} />
                        <Earth />
                    </Canvas>
                </div>
            </div>

            {/* Ambient particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan rounded-full"
                    initial={{ 
                        x: Math.random() * window.innerWidth, 
                        y: Math.random() * window.innerHeight,
                        opacity: 0.1 
                    }}
                    animate={{
                        x: [null, Math.random() * window.innerWidth],
                        y: [null, Math.random() * window.innerHeight],
                        opacity: [0.1, 0.4, 0.1]
                    }}
                    transition={{
                        duration: 10 + Math.random() * 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default Login;
