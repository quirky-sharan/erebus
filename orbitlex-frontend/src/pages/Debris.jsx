import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, Box, ShieldAlert, Loader2 } from 'lucide-react';

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
      setError('Failed to run debris simulation.');
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

  const level = risk?.overall_risk_level || 'LOW';
  const badgeClass =
    level === 'HIGH'
      ? 'text-danger border-danger/20 bg-danger/10'
      : level === 'MEDIUM'
      ? 'text-gold border-gold/20 bg-gold/10'
      : 'text-green-400 border-green-500/20 bg-green-500/10';

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
            <Box className="w-6 h-6 text-gold" />
            <h1 className="text-4xl font-display font-bold text-white">Collision Risk Simulator</h1>
          </div>
          <p className="text-text-muted max-w-2xl">
            Fragmentation probability + annual collision estimate with orbital band mapping.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass p-7 rounded-[2rem] border border-cyan/10"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-6 h-6 text-gold" />
                    <h3 className="text-white font-bold">Simulation failed</h3>
                  </div>
                  <p className="text-text-muted">{error}</p>
                </motion.div>
              ) : null}

              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass p-7 rounded-[2rem] border border-cyan/10 flex items-center justify-center gap-3"
                >
                  <Loader2 className="w-6 h-6 animate-spin text-cyan" />
                  <span className="text-text-muted font-mono">Running simulation…</span>
                </motion.div>
              ) : null}

              {risk ? (
                <motion.div
                  key="risk"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass p-7 rounded-[2rem] border border-cyan/10"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="text-text-muted text-xs font-mono">Overall risk level</div>
                      <div className="text-5xl font-display font-bold text-white mt-1">{level}</div>
                    </div>
                    <div className={`px-4 py-2 rounded-full border text-xs font-bold ${badgeClass}`}>
                      {level} risk
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-void/30 border border-cyan/10 rounded-2xl p-5">
                      <div className="text-text-muted text-xs font-mono">Fragmentation probability</div>
                      <div className="text-3xl font-display font-bold text-cyan mt-1">{(risk.frag_prob * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-void/30 border border-cyan/10 rounded-2xl p-5">
                      <div className="text-text-muted text-xs font-mono">Annual collision probability</div>
                      <div className="text-3xl font-display font-bold text-white mt-1">
                        {Number(risk.collision_prob_annual).toExponential(2)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-void/20 border border-cyan/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert className="w-5 h-5 text-cyan" />
                      <h3 className="text-white font-bold">Orbital bands</h3>
                    </div>
                    <div className="space-y-3">
                      {risk.orbital_bands?.map((b) => (
                        <motion.div
                          key={b.band_name}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center justify-between gap-4 p-4 rounded-2xl border ${
                            b.sat_in_band ? 'border-cyan/40 bg-cyan/5' : 'border-cyan/10 bg-void/20'
                          }`}
                        >
                          <div>
                            <div className="text-white font-bold">{b.band_name}</div>
                            <div className="text-text-muted text-xs font-mono">
                              {b.alt_min}–{b.alt_max} km
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-cyan font-bold text-sm">{b.object_count.toLocaleString()} objects</div>
                            <div className="text-text-muted text-xs">
                              {b.sat_in_band ? 'Highlighted' : `Density: ${b.debris_density_class}`}
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

          <aside className="space-y-6">
            <div className="glass p-7 rounded-[2rem] border border-cyan/10">
              <div className="text-white font-display text-xl font-bold mb-2">Why this matters</div>
              <p className="text-text-muted leading-relaxed text-sm">
                Fragmentation increases persistent debris populations, and collision probability drives cumulative growth.
                Use these outputs to prioritize mitigation and end-of-life planning.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Debris;

