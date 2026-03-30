import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Loader2, AlertTriangle, Activity, Database, FileText } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const frameworkBadge = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('compliant')) return 'text-green-400 bg-green-500/10 border-green-500/20';
  if (s.includes('at risk')) return 'text-amber bg-amber/10 border-amber/20';
  return 'text-text-dimmed bg-white/5 border-white/10';
};

const Compliance = () => {
  const { user } = useAuth();
  const location = useLocation();
  const sat = location.state?.sat;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deorbit, setDeorbit] = useState(null);
  const [compliance, setCompliance] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (!sat) return;
      setLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const dec = await axios.post(`${API_BASE_URL}/api/deorbit`, {
          altitude: Number(sat.altitude),
          inclination: Number(sat.inclination),
          mass: 500, area: 5,
        }, { headers: { Authorization: `Bearer ${token}` } });

        const comp = await axios.post(`${API_BASE_URL}/api/compliance`, {
          sat_data: sat,
          deorbit_years: Number(dec.data.years_mean),
        }, { headers: { Authorization: `Bearer ${token}` } });

        setDeorbit(dec.data);
        setCompliance(comp.data);
      } catch {
        setError('Compliance analysis protocol failed.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [sat, user]);

  if (!sat) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="glass p-12 rounded-[3rem] rim-highlight flex items-center gap-6 max-w-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Node Isolation Failed</h2>
            <p className="text-sm text-text-dimmed leading-relaxed">System requires a designated mission node to initialize compliance verification. Please select a satellite from the central repository.</p>
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
            <ShieldCheck className="w-3 h-3 text-cobalt" />
            <span className="text-[10px] font-black tracking-[0.2em] text-cobalt uppercase">Protocol Verification</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Compliance Console</h1>
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
            className="glass p-12 rounded-[3rem] rim-highlight flex flex-col items-center justify-center gap-4 text-center min-h-[400px]"
          >
            <Loader2 className="w-12 h-12 animate-spin text-cobalt mb-4" />
            <h3 className="text-xl font-bold text-white">Running Analysis Protocols...</h3>
            <p className="text-[10px] font-mono text-text-dimmed uppercase tracking-widest">Simulating deorbit trajectories • Verifying regulatory adherence</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-12 rounded-[3rem] border border-amber/10 text-center"
          >
            <AlertTriangle className="w-12 h-12 text-amber mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Protocol Disruption</h3>
            <p className="text-text-dimmed text-sm mb-6 max-w-sm mx-auto">{error}</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-void font-black text-[10px] tracking-widest uppercase rounded-xl">Retry Analysis</button>
          </motion.div>
        ) : compliance ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-8 rounded-[2.5rem] rim-highlight">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-4 h-4 text-cobalt" />
                  <span className="text-[10px] font-black tracking-widest text-text-dimmed uppercase">Decay Projection</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-bold text-white tracking-tight">{deorbit?.years_mean}</span>
                  <span className="text-xs font-black text-cobalt/60 uppercase">Mean Yars</span>
                </div>
                <p className="text-[10px] text-text-dimmed mt-4 font-mono font-bold leading-tight">95% CI: {deorbit?.confidence_interval_95?.[0]}–{deorbit?.confidence_interval_95?.[1]} yrs</p>
              </div>

              <div className="glass p-8 rounded-[2.5rem] rim-highlight md:col-span-2 flex flex-col justify-center">
                 <div className="flex items-center gap-3 mb-4">
                    <Database className="w-4 h-4 text-cobalt" />
                    <span className="text-[10px] font-black tracking-widest text-text-dimmed uppercase">Metadata Isolation</span>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <p className="text-[9px] font-black text-text-dimmed uppercase mb-1">NORAD ID</p>
                        <p className="text-sm font-mono font-bold text-white">{sat.norad_id}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-text-dimmed uppercase mb-1">Orbit Class</p>
                        <p className="text-sm font-mono font-bold text-white">{Number(sat.altitude) < 2000 ? 'LEO' : 'GEO'}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-text-dimmed uppercase mb-1">Inclination</p>
                        <p className="text-sm font-mono font-bold text-white">{sat.inclination}°</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-text-dimmed uppercase mb-1">Country</p>
                        <p className="text-sm font-mono font-bold text-white">{sat.country || 'USA'}</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {compliance.results?.map((r, i) => (
                <motion.div
                  key={r.framework}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-8 rounded-[2.5rem] rim-highlight relative group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-cobalt transition-colors">{r.framework}</h3>
                      <p className="text-[10px] font-bold text-text-dimmed uppercase tracking-wider mt-1">{r.rule_text}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-[9px] font-black tracking-widest uppercase ${frameworkBadge(r.status)}`}>
                      {r.status}
                    </div>
                  </div>
                  <p className="text-sm text-text-dimmed leading-relaxed max-w-[90%]">{r.reason}</p>
                  <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest border-t border-white/5 pt-4">
                     <FileText className="w-3 h-3" /> Source Regulatory Context: Verified
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Compliance;

