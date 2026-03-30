import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const frameworkBadge = (frameworkStatus) => {
  const status = (frameworkStatus || '').toLowerCase();
  if (status.includes('compliant')) {
    return 'text-green-400 border-green-500/20 bg-green-500/10';
  }
  if (status.includes('at risk')) {
    return 'text-gold border-gold/20 bg-gold/10';
  }
  if (status.includes('non-compliant')) {
    return 'text-gold border-gold/20 bg-gold/10';
  }
  return 'text-text-muted border-cyan/20 bg-cyan/10';
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

        const dec = await axios.post(
          `${API_BASE_URL}/api/deorbit`,
          {
            altitude: Number(sat.altitude),
            inclination: Number(sat.inclination),
            mass: 500,
            area: 5,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const comp = await axios.post(
          `${API_BASE_URL}/api/compliance`,
          {
            sat_data: sat,
            deorbit_years: Number(dec.data.years_mean),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDeorbit(dec.data);
        setCompliance(comp.data);
      } catch {
        setError('Failed to compute compliance.');
        setDeorbit(null);
        setCompliance(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [sat, user]);

  if (!sat) {
    return (
      <div className="min-h-screen bg-void pt-24 pb-20 px-6 overflow-hidden">
        <Navbar />
        <StarfieldCanvas />
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="glass rounded-[2.5rem] p-10 border border-dashed border-cyan/20 flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-gold" />
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">No satellite loaded</h2>
              <p className="text-text-muted">Open a satellite from Search first.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void pt-24 pb-20 px-6 overflow-hidden">
      <Navbar />
      <StarfieldCanvas />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-6 h-6 text-cyan" />
            <h1 className="text-4xl font-display font-bold text-white">Regulatory Compliance Engine</h1>
          </div>
          <p className="text-text-muted max-w-2xl">
            Framework-by-framework verdicts driven by the physics-based deorbit prediction.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass p-8 rounded-[2.5rem] border border-cyan/10 flex items-center gap-3 justify-center"
            >
              <Loader2 className="w-6 h-6 animate-spin text-cyan" />
              <span className="text-text-muted font-mono">Running compliance checks…</span>
            </motion.div>
          ) : null}

          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass p-8 rounded-[2.5rem] border border-cyan/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-gold" />
                <h2 className="text-white font-bold">Compliance failed</h2>
              </div>
              <p className="text-text-muted">{error}</p>
            </motion.div>
          ) : null}

          {compliance ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="glass p-6 rounded-[2rem] border border-cyan/10">
                  <div className="text-text-muted text-xs font-mono">Predicted deorbit mean</div>
                  <div className="text-4xl font-display font-bold text-cyan mt-1">
                    {deorbit?.years_mean} <span className="text-[14px] text-text-muted ml-2">years</span>
                  </div>
                  <div className="text-text-muted text-sm mt-2">
                    95% CI: {deorbit?.confidence_interval_95?.[0]}–{deorbit?.confidence_interval_95?.[1]} years
                  </div>
                </div>

                <div className="glass p-6 rounded-[2rem] border border-cyan/10">
                  <div className="text-text-muted text-xs font-mono">Satellite</div>
                  <div className="text-2xl font-display font-bold text-white mt-1">{sat.name}</div>
                  <div className="text-text-muted text-sm mt-2">
                    NORAD ID: <span className="text-white font-mono">{sat.norad_id}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {compliance.results?.map((r) => (
                  <motion.div
                    key={r.framework}
                    whileHover={{ y: -4, boxShadow: '0 0 20px rgba(0,194,255,0.15)' }}
                    className="glass p-6 rounded-[2rem] border border-cyan/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-white font-bold text-xl">{r.framework}</div>
                        <div className="text-text-muted text-sm mt-1">{r.rule_text}</div>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-full border text-xs font-bold whitespace-nowrap ${frameworkBadge(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </div>
                    </div>
                    <div className="mt-4 text-text-muted text-sm leading-relaxed">{r.reason}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Compliance;

