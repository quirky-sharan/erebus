import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, Box, ShieldAlert, Loader2, Activity, Database, Info, Layers } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Debris = () => {
    const { user } = useAuth();
    const location = useLocation();
    const sat = location.state?.sat;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [risk, setRisk] = useState(null);

    const run = async () => {
        if (!sat) return;
        setLoading(true);
        setError(null);
        try {
            const token = await user.getIdToken();
            const res = await axios.post(
                `${API_BASE_URL}/api/debris`,
                sat,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRisk(res.data);
        } catch {
            setError('Risk simulation protocol failure.');
            setRisk(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!sat) return;
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sat]);

    if (!sat) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="glass p-12 rounded-[3rem] rim-highlight flex items-center gap-6 max-w-xl">
                    <div className="w-16 h-16 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-amber" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Debris Module Offline</h2>
                        <p className="text-sm text-text-dimmed leading-relaxed">System requires a designated mission node to initialize fragmentation and collision simulations. Please select a target from the central repository.</p>
                    </div>
                </div>
            </div>
        );
    }

    const level = risk?.overall_risk_level || 'LOW';
    const badgeClass =
        level === 'HIGH'
            ? 'text-amber bg-amber/10 border-amber/20'
            : level === 'MEDIUM'
            ? 'text-amber/80 bg-amber/5 border-amber/10'
            : 'text-green-400 bg-green-500/10 border-green-500/20';

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3 px-3 py-1 bg-cobalt/5 border border-cobalt/10 rounded-full w-fit">
                        <Box className="w-3 h-3 text-cobalt" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-cobalt uppercase">Debris Risk Assessment</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Collision Intelligence</h1>
                </div>

                <div className="flex items-center gap-4 text-right">
                    <div className="px-5 py-3 glass rounded-2xl rim-highlight">
                        <p className="text-[9px] font-black text-text-dimmed uppercase tracking-widest leading-none mb-1">Target Mission</p>
                        <p className="text-lg font-mono font-bold text-white leading-none tracking-tight">{sat.name}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Context Panel */}
                <div className="lg:col-span-8 space-y-8">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass p-12 rounded-[3.5rem] rim-highlight flex flex-col items-center justify-center gap-4 text-center min-h-[500px]"
                            >
                                <Loader2 className="w-12 h-12 animate-spin text-cobalt mb-4" />
                                <h3 className="text-xl font-bold text-white">Simulating Fragmentation</h3>
                                <p className="text-[10px] font-mono text-text-dimmed uppercase tracking-widest">Iterating spatial densities • Verifying collision probability</p>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass p-12 rounded-[3.5rem] border border-amber/10 text-center"
                            >
                                <AlertTriangle className="w-12 h-12 text-amber mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">Assessment Aborted</h3>
                                <p className="text-text-dimmed text-sm mb-6 max-w-sm mx-auto">{error}</p>
                                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-void font-black text-[10px] tracking-widest uppercase rounded-xl">Re-initialize</button>
                            </motion.div>
                        ) : risk ? (
                            <motion.div
                                key="risk"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="glass p-10 rounded-[3rem] rim-highlight md:col-span-1 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-4">
                                            <ShieldAlert className="w-4 h-4 text-cobalt" />
                                            <span className="text-[10px] font-black text-text-dimmed uppercase tracking-widest">Composite Status</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-mono font-bold text-white tracking-tighter">{level}</span>
                                            <div className={`w-2 h-2 rounded-full ${level === 'HIGH' ? 'bg-amber' : level === 'MEDIUM' ? 'bg-amber/60' : 'bg-green-400'} animate-pulse`} />
                                        </div>
                                    </div>

                                    <div className="glass p-10 rounded-[3rem] rim-highlight md:col-span-2 grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[9px] font-black text-text-dimmed uppercase mb-1">Fragmentation Prob.</p>
                                            <p className="text-2xl font-mono font-bold text-white leading-none tracking-tight">{(risk.frag_prob * 100).toFixed(1)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-text-dimmed uppercase mb-1">Annual Collision Est.</p>
                                            <p className="text-2xl font-mono font-bold text-white leading-none tracking-tight">
                                                {Number(risk.collision_prob_annual).toExponential(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass p-10 rounded-[3rem] rim-highlight">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                            <Layers className="w-5 h-5 text-cobalt" /> Tactical Band Mapping
                                        </h3>
                                        <span className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[9px] font-mono text-text-dimmed font-black tracking-widest uppercase">Global Sensor Network: Active</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {risk.orbital_bands?.map((b) => (
                                            <motion.div
                                                key={b.band_name}
                                                className={`flex items-center justify-between gap-4 p-6 rounded-2xl border transition-all ${
                                                    b.sat_in_band ? 'border-cobalt/40 bg-cobalt/5 rim-highlight' : 'border-white/5 bg-white/[0.02]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-1 h-8 rounded-full ${b.sat_in_band ? 'bg-cobalt' : 'bg-white/5'}`} />
                                                    <div>
                                                        <div className="text-sm font-bold text-white transition-colors">{b.band_name}</div>
                                                        <div className="text-[10px] font-mono text-text-dimmed mt-0.5">
                                                            {b.alt_min}–{b.alt_max} KM
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-mono font-bold text-white tracking-widest">{b.object_count.toLocaleString()} <span className="text-[9px] text-text-dimmed">OBJS</span></div>
                                                    <div className="text-[9px] font-black text-cobalt/60 uppercase mt-1">
                                                        {b.debris_density_class} Density
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>

                {/* Tactical Context Panel */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="glass p-8 rounded-[3rem] rim-highlight bg-gradient-to-br from-cobalt/5 to-transparent">
                        <div className="w-10 h-10 rounded-xl bg-cobalt/10 border border-cobalt/20 flex items-center justify-center mb-6 text-cobalt">
                            <Info className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-4">Risk Significance</h3>
                        <p className="text-sm text-text-dimmed leading-relaxed">
                            Fragmentation events increase persistent debris populations exponentially. High collision probabilities necessitate immediate end-of-life protocol prioritization and sensor cross-referencing.
                        </p>
                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[9px] font-black text-text-dimmed uppercase tracking-widest leading-none">Simulation Fidelity</span>
                            <span className="text-[9px] font-mono font-bold text-cobalt uppercase">High Precision</span>
                        </div>
                    </section>

                    <div className="glass p-8 rounded-[3rem] rim-highlight flex flex-col items-center justify-center text-center gap-3">
                         <div className="w-12 h-1 bg-white/[0.03] rounded-full mb-2" />
                         <p className="text-[10px] font-mono text-text-dimmed uppercase leading-relaxed font-bold">Orbital assets tracked above 500km altitude are subject to cumulative fragmentation risk monitoring.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Debris;

