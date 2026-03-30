import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, Zap, Loader2, Cpu, Activity, Database, History, Info } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Deorbit = () => {
    const { user } = useAuth();
    const location = useLocation();
    const sat = location.state?.sat;

    const [altitude, setAltitude] = useState(400);
    const [inclination, setInclination] = useState(51.6);
    const [mass, setMass] = useState(500);
    const [area, setArea] = useState(5);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!sat) return;
        if (typeof sat.altitude === 'number') setAltitude(sat.altitude);
        if (typeof sat.inclination === 'number') setInclination(sat.inclination);
    }, [sat]);

    const tokenPromise = useMemo(async () => {
        if (!user) return null;
        try {
            return await user.getIdToken();
        } catch {
            return null;
        }
    }, [user]);

    const runPrediction = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await tokenPromise;
            if (!token) throw new Error('Authentication failure.');

            const res = await axios.post(
                `${API_BASE_URL}/api/deorbit`,
                {
                    altitude: Number(altitude),
                    inclination: Number(inclination),
                    mass: Number(mass),
                    area: Number(area),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setResult(res.data);
        } catch (e) {
            setError('Prediction simulation failed.');
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    if (!sat) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="glass p-12 rounded-[3rem] rim-highlight flex items-center gap-6 max-w-xl">
                    <div className="w-16 h-16 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-amber" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Physics Module Offline</h2>
                        <p className="text-sm text-text-dimmed leading-relaxed">No mission node detected. Please select a target from the global repository to initialize decay simulations.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3 px-3 py-1 bg-cobalt/5 border border-cobalt/10 rounded-full w-fit">
                        <Zap className="w-3 h-3 text-cobalt" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-cobalt uppercase">Trajectory Simulation</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Orbital Decay Console</h1>
                </div>

                <div className="flex items-center gap-4 text-right">
                    <div className="px-5 py-3 glass rounded-2xl rim-highlight">
                        <p className="text-[9px] font-black text-text-dimmed uppercase tracking-widest leading-none mb-1">Target Mission</p>
                        <p className="text-lg font-mono font-bold text-white leading-none tracking-tight">{sat.name}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Telemetry Config Panel */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <section className="glass p-8 rounded-[2.5rem] rim-highlight">
                        <div className="flex items-center gap-3 mb-8">
                            <Cpu className="w-5 h-5 text-cobalt" />
                            <h2 className="text-lg font-bold text-white">Core Parameters</h2>
                        </div>

                        <div className="space-y-5">
                            {[
                                { label: 'Altitude (km)', state: altitude, set: setAltitude },
                                { label: 'Inclination (deg)', state: inclination, set: setInclination },
                                { label: 'Mass (kg)', state: mass, set: setMass },
                                { label: 'Active Area (m²)', state: area, set: setArea }
                            ].map((input) => (
                                <div key={input.label}>
                                    <label className="text-[10px] font-black text-text-dimmed uppercase tracking-widest mb-2 block">{input.label}</label>
                                    <input
                                        type="number"
                                        value={input.state}
                                        onChange={(e) => input.set(e.target.value)}
                                        className="w-full bg-void/50 border border-white/5 rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-cobalt/40 transition-all"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={runPrediction}
                            disabled={loading}
                            className="mt-10 w-full py-5 bg-cobalt text-white font-black text-[10px] tracking-[0.2em] uppercase rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow-cobalt flex items-center justify-center gap-3 disabled:opacity-40"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                            Execute Simulation
                        </button>
                    </section>

                    <div className="glass p-6 rounded-[2rem] rim-highlight flex items-center gap-4 text-text-dimmed">
                        <Info className="w-5 h-5 shrink-0" />
                        <p className="text-[10px] font-medium leading-relaxed">Predictions utilize J4-perturbed drag models and desaturated Monte Carlo uncertainty bounds.</p>
                    </div>
                </div>

                {/* Analysis Visualization Panel */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass p-12 rounded-[3.5rem] rim-highlight flex flex-col items-center justify-center gap-4 text-center h-full min-h-[500px]"
                            >
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-cobalt/20 animate-spin-slow" />
                                    <Zap className="absolute inset-0 m-auto w-10 h-10 text-cobalt animate-pulse" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Simulation in Progress</h3>
                                <p className="text-[10px] font-mono text-text-dimmed uppercase tracking-[0.2em]">Processing drag coefficients • Iterating uncertainty nodes</p>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass p-12 rounded-[3.5rem] border border-amber/10 h-full flex flex-col items-center justify-center text-center"
                            >
                                <AlertTriangle className="w-16 h-16 text-amber mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">Simulation Disruption</h3>
                                <p className="text-text-dimmed text-sm max-w-sm">{error}</p>
                            </motion.div>
                        ) : result ? (
                            <motion.div
                                key="res"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass p-10 rounded-[3rem] rim-highlight bg-gradient-to-br from-cobalt/10 to-transparent">
                                        <div className="flex items-center gap-3 mb-6">
                                            <History className="w-4 h-4 text-cobalt" />
                                            <span className="text-[10px] font-black text-text-dimmed uppercase tracking-widest">Mean Decay Timeline</span>
                                        </div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-6xl font-mono font-bold text-white tracking-tighter">{result.years_mean}</span>
                                            <span className="text-sm font-black text-cobalt/60 uppercase">Solar Years</span>
                                        </div>
                                    </div>

                                    <div className="glass p-10 rounded-[3rem] rim-highlight">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Database className="w-4 h-4 text-cobalt" />
                                            <span className="text-[10px] font-black text-text-dimmed uppercase tracking-widest">95% Uncertainty Bound</span>
                                        </div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl font-mono font-bold text-white tracking-tighter">
                                                {result.confidence_interval_95?.[0]}–{result.confidence_interval_95?.[1]}
                                            </span>
                                            <span className="text-xs font-black text-white/20 uppercase">Year Window</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass p-10 rounded-[3rem] rim-highlight relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                        <ShieldAlert className="w-48 h-48 text-cobalt" />
                                     </div>
                                     <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
                                        <Activity className="w-5 h-5 text-cobalt" /> Compliance Verification
                                     </h3>

                                     <div className="flex flex-wrap gap-6">
                                        {[
                                            { label: 'IADC Rule 1', status: result.iadc_compliant },
                                            { label: 'FCC Legacy', status: result.fcc_compliant }
                                        ].map((r) => (
                                            <div key={r.label} className="flex flex-col gap-3 min-w-[200px]">
                                                <p className="text-[10px] font-black text-text-dimmed uppercase tracking-widest leading-none">{r.label}</p>
                                                <div className={`px-4 py-3 rounded-2xl border flex items-center justify-between ${
                                                    r.status 
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                                    : 'bg-amber/10 text-amber border-amber/20'
                                                }`}>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{r.status ? 'Nominal' : 'Non-Compliant'}</span>
                                                    <div className={`w-2 h-2 rounded-full ${r.status ? 'bg-green-400' : 'bg-amber'} animate-pulse`} />
                                                </div>
                                            </div>
                                        ))}
                                     </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full glass rounded-[3.5rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center p-12 min-h-[500px]">
                                <Database className="w-20 h-20 text-white/5 mb-6" />
                                <h3 className="text-xl font-bold text-white opacity-40">Awaiting Signal</h3>
                                <p className="text-xs text-text-dimmed max-w-xs mt-2">Adjust mission parameters and execute simulation to reveal orbital decay projections.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Deorbit;

