import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, Zap, Loader2 } from 'lucide-react';

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
    // Keep demo-friendly defaults for mass/area.
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
      if (!token) throw new Error('Missing auth token');

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
      setError('Failed to run prediction.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

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
            <Zap className="w-6 h-6 text-cyan" />
            <h1 className="text-4xl font-display font-bold text-white">Orbital Decay Predictor</h1>
          </div>
          <p className="text-text-muted max-w-2xl">
            Physics-based deorbit timeline using deterministic drag + Monte Carlo uncertainty bounds.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 glass p-7 rounded-[2rem] border border-cyan/10"
          >
            <div className="mb-6">
              <h2 className="text-white text-xl font-display font-bold mb-1">Inputs</h2>
              <p className="text-text-muted text-sm">Defaults pre-filled from the selected satellite.</p>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="text-text-muted text-xs font-mono">Altitude (km)</span>
                <input
                  type="number"
                  value={altitude}
                  onChange={(e) => setAltitude(e.target.value)}
                  className="mt-2 w-full bg-void/40 border border-cyan/10 rounded-xl p-3 text-white outline-none focus:border-cyan/40"
                />
              </label>
              <label className="block">
                <span className="text-text-muted text-xs font-mono">Inclination (deg)</span>
                <input
                  type="number"
                  value={inclination}
                  onChange={(e) => setInclination(e.target.value)}
                  className="mt-2 w-full bg-void/40 border border-cyan/10 rounded-xl p-3 text-white outline-none focus:border-cyan/40"
                />
              </label>
              <label className="block">
                <span className="text-text-muted text-xs font-mono">Mass (kg)</span>
                <input
                  type="number"
                  value={mass}
                  onChange={(e) => setMass(e.target.value)}
                  className="mt-2 w-full bg-void/40 border border-cyan/10 rounded-xl p-3 text-white outline-none focus:border-cyan/40"
                />
              </label>
              <label className="block">
                <span className="text-text-muted text-xs font-mono">Area (m²)</span>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="mt-2 w-full bg-void/40 border border-cyan/10 rounded-xl p-3 text-white outline-none focus:border-cyan/40"
                />
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={runPrediction}
              disabled={loading}
              className="mt-7 w-full bg-gradient-to-r from-cyan to-orbit text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              Run Prediction
            </motion.button>
          </motion.section>

          <section className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                      className="glass p-7 rounded-[2rem] border border-gold/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-6 h-6 text-gold" />
                    <h3 className="text-white font-bold">Prediction failed</h3>
                  </div>
                  <p className="text-text-muted">{error}</p>
                </motion.div>
              ) : null}

              {result ? (
                <motion.div
                  key="res"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass p-7 rounded-[2rem] border border-cyan/10"
                >
                  <h3 className="text-white font-display text-2xl font-bold mb-4">Results</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-void/30 border border-cyan/10 rounded-2xl p-5">
                      <div className="text-text-muted text-xs font-mono">Monte Carlo mean</div>
                      <div className="text-4xl font-display font-bold text-cyan mt-1">
                        {result.years_mean}
                        <span className="text-[14px] text-text-muted ml-2">years</span>
                      </div>
                    </div>
                    <div className="bg-void/30 border border-cyan/10 rounded-2xl p-5">
                      <div className="text-text-muted text-xs font-mono">95% confidence interval</div>
                      <div className="text-3xl font-display font-bold text-white mt-1">
                        {result.confidence_interval_95?.[0]}–{result.confidence_interval_95?.[1]}
                        <span className="text-[14px] text-text-muted ml-2">years</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-void/20 border border-cyan/10 rounded-2xl p-5">
                    <div className="text-white font-bold mb-3">Rule quick-check</div>
                    <div className="flex flex-wrap gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          result.iadc_compliant ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-gold border-gold/20 bg-gold/10'
                        }`}
                      >
                        IADC: {result.iadc_compliant ? 'Compliant' : 'At Risk'}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          result.fcc_compliant ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-gold border-gold/20 bg-gold/10'
                        }`}
                      >
                        FCC: {result.fcc_compliant ? 'Compliant' : 'At Risk'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Deorbit;

