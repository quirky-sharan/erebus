import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, CheckCircle2, Leaf, Loader2, Recycle, ArrowRight, ShieldCheck, Activity, Info } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const materialOptions = [
    { label: 'Plastic Polymers', value: 'plastic' },
    { label: 'Metallic Alloys', value: 'metal' },
    { label: 'Cellulose / Paper', value: 'paper' },
    { label: 'Silicates / Glass', value: 'glass' },
    { label: 'Electronic Components', value: 'e-waste' },
    { label: 'Organic Matter', value: 'organic' },
    { label: 'Mixed Composites', value: 'mixed' },
];

const regionOptions = [
    { label: 'Global (Standard)', value: 'Global' },
    { label: 'EU Regulatory', value: 'EU' },
    { label: 'US EPA / FCC', value: 'US' },
    { label: 'Rest of World', value: 'Other' },
];

const RangeBar = ({ lo, hi, label, color = 'cobalt' }) => {
    const width = hi ? Math.max(lo, 0) : 0;
    const barColor = color === 'green' ? 'bg-emerald-500/30' : 'bg-cobalt/30';
    const borderColor = color === 'green' ? 'border-emerald-500/20' : 'border-cobalt/20';

    return (
        <div className={`glass p-6 rounded-[2.5rem] rim-highlight ${borderColor}`}>
            <div className="text-[10px] font-black text-text-dimmed uppercase tracking-[0.2em] mb-4">{label}</div>
            <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-white tracking-tighter">
                    {typeof lo === 'number' ? `${lo}%` : '-'}
                </span>
                <span className="text-sm text-text-dimmed font-medium">to {typeof hi === 'number' ? `${hi}%` : '-'}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`${barColor} h-full`} 
                />
            </div>
        </div>
    );
};

const Waste = () => {
    const { user } = useAuth();
    const [material, setMaterial] = useState('plastic');
    const [description, setDescription] = useState('');
    const [weightKg, setWeightKg] = useState('');
    const [region, setRegion] = useState('Global');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const run = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const token = await user.getIdToken();
            const res = await axios.post(
                `${API_BASE_URL}/api/waste/analyze`,
                { material, description, weight_kg: weightKg ? Number(weightKg) : null, region },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResult(res.data);
        } catch (e) {
            setError('Intelligence retrieval failure.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <header>
                <div className="flex items-center gap-3 mb-3 px-3 py-1 bg-cobalt/5 border border-cobalt/10 rounded-full w-fit">
                    <Recycle className="w-3 h-3 text-cobalt" />
                    <span className="text-[10px] font-black tracking-[0.2em] text-cobalt uppercase">Material analysis protocol</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Waste & Circularity Console</h1>
                <p className="text-text-dimmed text-sm max-w-2xl mt-4 leading-relaxed font-medium">
                    Integrated segregation planning and recycling methodology assessment utilizing policy-aware RAG intelligence.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 space-y-6"
                >
                    <div className="glass p-10 rounded-[3rem] rim-highlight">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Mission Inputs</h3>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-dimmed uppercase tracking-widest ml-1">Composition</label>
                                <select
                                    value={material}
                                    onChange={(e) => setMaterial(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white text-sm font-bold focus:ring-1 focus:ring-cobalt/50 transition-all outline-none"
                                >
                                    {materialOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value} className="bg-void">{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-dimmed uppercase tracking-widest ml-1">Telemetry Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Describe material anomalies..."
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white text-sm font-bold focus:ring-1 focus:ring-cobalt/50 transition-all outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-dimmed uppercase tracking-widest ml-1">Mass (KG)</label>
                                    <input
                                        type="number"
                                        value={weightKg}
                                        onChange={(e) => setWeightKg(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white text-sm font-bold focus:ring-1 focus:ring-cobalt/50 transition-all outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-dimmed uppercase tracking-widest ml-1">Region</label>
                                    <select
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white text-sm font-bold focus:ring-1 focus:ring-cobalt/50 transition-all outline-none"
                                    >
                                        {regionOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value} className="bg-void">{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={run}
                                disabled={loading}
                                className="w-full bg-white text-void font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-glow-white/10 mt-4"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                Initiate Analysis
                            </motion.button>
                        </div>
                    </div>
                </motion.section>

                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {loading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="glass p-12 rounded-[3.5rem] rim-highlight flex flex-col items-center justify-center gap-8 min-h-[600px] text-center"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-cobalt/20 animate-spin-slow" />
                                    <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-cobalt animate-spin" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Simulating Circularity Path</h3>
                                    <p className="text-[10px] font-mono text-text-dimmed uppercase tracking-[0.2em]">Evaluating recovery fractions • Cross-referencing regulatory bounds</p>
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass p-12 rounded-[3.5rem] border border-amber/10 text-center"
                            >
                                <AlertTriangle className="w-16 h-16 text-amber mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">Analysis Protocol Failure</h3>
                                <p className="text-text-dimmed text-sm mb-8 max-w-sm mx-auto">{error}</p>
                                <button onClick={run} className="px-10 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all">Retry Synchronization</button>
                            </motion.div>
                        )}

                        {result && !loading && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="glass p-10 rounded-[3.5rem] rim-highlight flex flex-col md:flex-row md:items-center justify-between gap-10">
                                    <div className="space-y-3">
                                        <div className="text-[10px] font-black text-text-dimmed uppercase tracking-[0.2em]">Material Classification</div>
                                        <div className="text-3xl font-bold text-white tracking-tight">
                                            {result.classification?.category} <span className="text-cobalt ml-2">{result.classification?.subtype}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                            <span className="text-xs font-mono font-bold text-text-dimmed">Contamination Risk: {result.classification?.contamination_risk}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center md:items-end gap-2">
                                        <div className="px-6 py-3 rounded-full bg-cobalt/10 border border-cobalt/20 text-cobalt font-black text-[10px] uppercase tracking-widest">
                                            Confidence {Math.round((result.classification?.confidence || 0) * 100)}%
                                        </div>
                                        <p className="text-[9px] font-black text-text-dimmed uppercase tracking-widest">Protocol: V-9 Intelligence</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <RangeBar
                                        label="Recyclable Fraction"
                                        lo={result.recovery_estimates?.recyclable_fraction_pct_range?.[0]}
                                        hi={result.recovery_estimates?.recyclable_fraction_pct_range?.[1]}
                                    />
                                    <RangeBar
                                        label="Circular Potentials"
                                        lo={result.recovery_estimates?.reusable_fraction_pct_range?.[0]}
                                        hi={result.recovery_estimates?.reusable_fraction_pct_range?.[1]}
                                        color="green"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section className="glass p-10 rounded-[3.5rem] rim-highlight">
                                        <div className="flex items-center gap-3 mb-8">
                                            <Info className="w-4 h-4 text-cobalt" />
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Segregation Strategy</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {(result.segregation?.segregation_steps || []).map((step, i) => (
                                                <div key={i} className="flex gap-4 group">
                                                    <div className="w-5 h-5 rounded-lg bg-cobalt/5 border border-cobalt/10 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-cobalt group-hover:bg-cobalt group-hover:text-white transition-all">{i + 1}</div>
                                                    <p className="text-xs font-medium text-text-dimmed leading-relaxed group-hover:text-white transition-colors">{step}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="glass p-10 rounded-[3.5rem] rim-highlight">
                                        <div className="flex items-center gap-3 mb-8">
                                            <Activity className="w-4 h-4 text-emerald-500" />
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Recovery Protocols</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                {(result.technologies?.technology_steps || []).map((tech, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                                        <span className="text-xs font-medium text-text-dimmed group-hover:text-white transition-colors">{tech}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-6 border-t border-white/5">
                                                <span className="text-[9px] font-black text-text-dimmed uppercase tracking-widest block mb-4">Safety Advisories</span>
                                                <div className="space-y-2">
                                                    {(result.technologies?.safety_notes || []).map((note, i) => (
                                                        <p key={i} className="text-[11px] font-medium text-amber/80 leading-relaxed">• {note}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <section className="glass p-10 rounded-[3.5rem] rim-highlight bg-cobalt/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Strategic Overview</h3>
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-void border border-white/5">
                                            <span className="text-[10px] font-bold text-text-dimmed">Points Award:</span>
                                            <span className="text-sm font-bold text-emerald-500">+{result.consumer_awareness?.points_award}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div>
                                            <span className="text-[9px] font-black text-text-dimmed uppercase tracking-[0.2em] mb-3 block">Compliance Verdict</span>
                                            <p className="text-sm font-bold text-white mb-4">{result.policy_compliance?.verdict}</p>
                                            <div className="space-y-2">
                                                {(result.policy_compliance?.checklist || []).map((check, i) => (
                                                    <p key={i} className="text-[11px] font-medium text-text-dimmed">• {check}</p>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-text-dimmed uppercase tracking-[0.2em] mb-3 block">Regenerative Design</span>
                                            <p className="text-xs font-medium text-text-dimmed leading-relaxed italic mb-4">"{result.circular_product_design?.reuse_strategy}"</p>
                                            <div className="space-y-2">
                                                {(result.circular_product_design?.design_guidelines || []).map((guide, i) => (
                                                    <p key={i} className="text-[11px] font-medium text-white/80">• {guide}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Waste;

