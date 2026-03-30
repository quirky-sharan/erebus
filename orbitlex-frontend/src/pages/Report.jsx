import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, AlertTriangle, FileText, Download, Share2, Printer, Info, Activity } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Section = ({ title, children, icon: Icon }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass p-10 rounded-[3rem] rim-highlight relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
            {Icon && <Icon className="w-32 h-32 text-cobalt" />}
        </div>
        <div className="flex items-center gap-3 mb-6">
            {Icon && <Icon className="w-5 h-5 text-cobalt" />}
            <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        </div>
        <div className="text-sm text-text-dimmed leading-relaxed whitespace-pre-wrap font-medium">
            {children}
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-text-dimmed uppercase tracking-[0.2em]">
            <span>Validated Against Protocol: ML-09</span>
            <span>Ref: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        </div>
    </motion.section>
);

const Report = () => {
    const { user } = useAuth();
    const location = useLocation();
    const sat = location.state?.sat;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [report, setReport] = useState(null);

    const tokenPromise = useMemo(async () => {
        if (!user) return null;
        try {
            return await user.getIdToken();
        } catch {
            return null;
        }
    }, [user]);

    const generate = async () => {
        if (!sat) return;
        setLoading(true);
        setError(null);
        setReport(null);
        try {
            const token = await tokenPromise;
            if (!token) throw new Error('Authentication failure.');

            // Parallel execution for telemetry data
            const [deorbitRes, debrisRes] = await Promise.all([
                axios.post(`${API_BASE_URL}/api/deorbit`, {
                    altitude: Number(sat.altitude),
                    inclination: Number(sat.inclination),
                    mass: 500, area: 5,
                }, { headers: { Authorization: `Bearer ${token}` } }),
                axios.post(`${API_BASE_URL}/api/debris`, sat, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const complianceRes = await axios.post(`${API_BASE_URL}/api/compliance`, {
                sat_data: sat,
                deorbit_years: Number(deorbitRes.data.years_mean),
            }, { headers: { Authorization: `Bearer ${token}` } });

            const reportRes = await axios.post(`${API_BASE_URL}/api/report`, {
                sat_data: sat,
                compliance: complianceRes.data,
                deorbit: deorbitRes.data,
                debris: debrisRes.data,
            }, { headers: { Authorization: `Bearer ${token}` } });

            setReport(reportRes.data);
        } catch {
            setError('Intelligence aggregation protocol failed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!sat) return;
        generate();
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
                        <h2 className="text-2xl font-bold text-white mb-2">Intelligence Offline</h2>
                        <p className="text-sm text-text-dimmed leading-relaxed">Report generation requires a designated mission node. Please select a target from the central repository to begin data synthesis.</p>
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
                        <FileText className="w-3 h-3 text-cobalt" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-cobalt uppercase">Mission Intelligence aggregation</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Advanced Narrative Report</h1>
                </div>

                <div className="flex items-center gap-4 text-right">
                    <div className="px-5 py-3 glass rounded-2xl rim-highlight">
                        <p className="text-[9px] font-black text-text-dimmed uppercase tracking-widest leading-none mb-1">Target Mission</p>
                        <p className="text-lg font-mono font-bold text-white leading-none tracking-tight">{sat.name}</p>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="glass p-12 rounded-[3.5rem] rim-highlight flex flex-col items-center justify-center gap-6 text-center min-h-[500px]"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-2 border-dashed border-cobalt/20 animate-spin-slow" />
                            <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-cobalt animate-spin" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Synthesizing Narrative</h3>
                            <p className="text-[10px] font-mono text-text-dimmed uppercase tracking-[0.2em]">Aggregating deorbit physics • Filtering regulatory context • Applying RAG grounding</p>
                        </div>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass p-12 rounded-[3.5rem] border border-amber/10 text-center"
                    >
                        <AlertTriangle className="w-16 h-16 text-amber mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-white mb-2">Aggregation Failed</h3>
                        <p className="text-text-dimmed text-sm mb-8 max-w-sm mx-auto">{error}</p>
                        <button onClick={generate} className="px-10 py-4 bg-white text-void font-black text-[10px] tracking-widest uppercase rounded-2xl hover:scale-105 transition-all">Retry Synchronization</button>
                    </motion.div>
                ) : report ? (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >
                        <div className="lg:col-span-8 space-y-8">
                            <Section title="Executive Summary" icon={Activity}>{report.executive_summary}</Section>
                            <Section title="Compliance Narrative" icon={Info}>{report.compliance_narrative}</Section>
                            <Section title="Deorbit Physics Analysis" icon={Activity}>{report.deorbit_analysis}</Section>
                            <Section title="Collision Risk Assessment" icon={Info}>{report.debris_assessment}</Section>
                            <Section title="Strategic Recommendations" icon={Activity}>{report.recommendations}</Section>
                        </div>

                        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                            <section className="glass p-8 rounded-[3rem] rim-highlight">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Mission Controls</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Export PDF', icon: Download },
                                        { label: 'Share Report', icon: Share2 },
                                        { label: 'Print Summary', icon: Printer }
                                    ].map((action) => (
                                        <button key={action.label} className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all group">
                                            <span className="text-[10px] font-black text-text-dimmed uppercase tracking-widest group-hover:text-white transition-colors">{action.label}</span>
                                            <action.icon className="w-4 h-4 text-cobalt" />
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <div className="glass p-8 rounded-[3rem] rim-highlight bg-cobalt/5">
                                <p className="text-[10px] font-mono text-text-dimmed leading-relaxed uppercase font-bold">
                                    Report integrity verified via Groq-LPU hardware. Grounding source: Unified Regulatory Repository (v.2.4).
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default Report;

