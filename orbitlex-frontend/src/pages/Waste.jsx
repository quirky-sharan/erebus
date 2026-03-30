import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Leaf, Loader2, Recycle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const materialOptions = [
  { label: 'Plastic', value: 'plastic' },
  { label: 'Metal', value: 'metal' },
  { label: 'Paper', value: 'paper' },
  { label: 'Glass', value: 'glass' },
  { label: 'E-waste', value: 'e-waste' },
  { label: 'Organic', value: 'organic' },
  { label: 'Mixed', value: 'mixed' },
];

const regionOptions = [
  { label: 'Global', value: 'Global' },
  { label: 'EU', value: 'EU' },
  { label: 'US', value: 'US' },
  { label: 'Other', value: 'Other' },
];

const TitleAnimated = ({ text }) => {
  const chars = useMemo(() => text.split(''), [text]);
  return (
    <div className="flex flex-wrap">
      {chars.map((c, idx) => (
        <motion.span
          key={`${c}-${idx}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03, duration: 0.5 }}
          className="font-display font-bold tracking-tight text-white"
        >
          {c}
        </motion.span>
      ))}
    </div>
  );
};

const RangeBar = ({ lo, hi, label, color = 'cyan' }) => {
  const width = hi ? Math.max(lo, 0) : 0;
  const barColor =
    color === 'green'
      ? 'bg-green-500/40'
      : color === 'gold'
      ? 'bg-gold/40'
      : 'bg-cyan/40';

  return (
    <div className="bg-void/30 border border-cyan/10 rounded-2xl p-5">
      <div className="text-text-muted text-xs font-mono">{label}</div>
      <div className="flex items-end gap-3 mt-2">
        <div className="text-4xl font-display font-bold text-white">
          {typeof lo === 'number' ? `${lo}%` : '-'}
        </div>
        <div className="text-sm text-text-muted mb-1">to {typeof hi === 'number' ? `${hi}%` : '-'}</div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-void/60 overflow-hidden">
        <div className={`${barColor}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

const Waste = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
        {
          material,
          description,
          weight_kg: weightKg ? Number(weightKg) : null,
          region,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (e) {
      setError('Failed to analyze waste item.');
    } finally {
      setLoading(false);
    }
  };

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
            <Recycle className="w-6 h-6 text-cyan" />
            <h1 className="text-4xl font-display font-bold">Waste Segregation & Circularity</h1>
          </div>
          <p className="text-text-muted max-w-2xl">
            Select a material, describe the item, and get a segregation plan, safe recycling technology guidance,
            and recyclability/reusability estimates grounded with policy-aware RAG + LLM outputs.
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
              <div className="text-text-muted text-xs font-mono">Inputs</div>
              <TitleAnimated text="Tell us what you have" />
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="text-text-muted text-xs font-mono">Material</span>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="mt-2 w-full bg-void/40 border border-cyan/10 rounded-xl p-3 text-white outline-none focus:border-cyan/40"
                >
                  {materialOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-text-muted text-xs font-mono">Description (optional)</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Example: 'plastic bottle with label, slightly greasy', 'laptop charger with cable', 'aluminum can, clean'..."
                  className="mt-2 w-full bg-void/40 border border-cyan/10 rounded-xl p-3 text-white outline-none focus:border-cyan/40"
                />
              </label>

              <label className="block">
                <span className="text-text-muted text-xs font-mono">Weight (kg, optional)</span>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="mt-2 w-full bg-void/40 border border-cyan/10 rounded-xl p-3 text-white outline-none focus:border-cyan/40"
                  placeholder="e.g., 1.2"
                  min="0"
                  step="0.1"
                />
              </label>

              <label className="block">
                <span className="text-text-muted text-xs font-mono">Region / compliance</span>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-2 w-full bg-void/40 border border-cyan/10 rounded-xl p-3 text-white outline-none focus:border-cyan/40"
                >
                  {regionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={run}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan to-orbit text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Leaf className="w-5 h-5" />}
                Analyze waste
              </motion.button>
            </div>
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
                    <div className="text-white font-bold">Analysis failed</div>
                  </div>
                  <div className="text-text-muted text-sm">{error}</div>
                </motion.div>
              ) : null}

              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass p-7 rounded-[2rem] border border-cyan/10 flex items-center gap-3"
                >
                  <Loader2 className="w-6 h-6 animate-spin text-cyan" />
                  <div className="text-text-muted font-mono">Computing segregation + recycling estimates…</div>
                </motion.div>
              ) : null}

              {result ? (
                <motion.div
                  key="res"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="glass p-7 rounded-[2rem] border border-cyan/10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-text-muted text-xs font-mono">Predicted classification</div>
                        <div className="text-2xl font-display font-bold text-white mt-1">
                          {result.classification?.category} <span className="text-cyan">{result.classification?.subtype}</span>
                        </div>
                        <div className="text-text-muted text-sm mt-2">
                          Contamination risk: <span className="text-white font-mono">{result.classification?.contamination_risk}</span>
                        </div>
                      </div>
                      <div className="px-4 py-2 rounded-full border border-cyan/20 bg-cyan/10 text-cyan font-bold text-sm">
                        Confidence {Math.round((result.classification?.confidence || 0) * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RangeBar
                      label="Recyclable fraction"
                      lo={result.recovery_estimates?.recyclable_fraction_pct_range?.[0]}
                      hi={result.recovery_estimates?.recyclable_fraction_pct_range?.[1]}
                      color="cyan"
                    />
                    <RangeBar
                      label="Reuse & Recovery Potential"
                      lo={result.recovery_estimates?.reusable_fraction_pct_range?.[0]}
                      hi={result.recovery_estimates?.reusable_fraction_pct_range?.[1]}
                      color="green"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-7 rounded-[2rem] border border-cyan/10">
                      <div className="text-white font-bold text-xl mb-3">Segregation & Sorting</div>
                      <div className="text-text-muted text-sm mb-3">
                        Recommended bins: {(result.segregation?.recommended_bins || []).join(' · ')}
                      </div>
                      <div className="space-y-2">
                        {(result.segregation?.segregation_steps || []).map((s, i) => (
                          <motion.div
                            key={`${i}-${s.slice(0, 16)}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-start gap-3"
                          >
                            <CheckCircle2 className="w-4 h-4 text-cyan mt-1 flex-shrink-0" />
                            <div className="text-text-muted text-sm leading-relaxed">{s}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="glass p-7 rounded-[2rem] border border-cyan/10">
                      <div className="text-white font-bold text-xl mb-3">Safe Recycling Technologies</div>
                      <div className="space-y-2">
                        {(result.technologies?.technology_steps || []).map((t, i) => (
                          <motion.div
                            key={`${i}-${t.slice(0, 16)}`}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="text-text-muted text-sm leading-relaxed"
                          >
                            • {t}
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <div className="text-text-muted text-xs font-mono mb-2">Safety notes</div>
                        <div className="space-y-2">
                          {(result.technologies?.safety_notes || []).map((n, i) => (
                            <motion.div
                              key={`sn-${i}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.03 }}
                              className="text-text-muted text-sm leading-relaxed"
                            >
                              • {n}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass p-7 rounded-[2rem] border border-cyan/10">
                    <div className="text-white font-bold text-xl mb-3">Consumer Awareness & Incentivization</div>
                    <div className="text-text-muted text-sm">
                      Award suggestion: <span className="text-white font-display text-2xl ml-2">{result.consumer_awareness?.points_award}</span>{' '}
                      <span className="text-text-muted">points</span>
                    </div>
                    <div className="text-text-muted text-sm mt-2">
                      {result.consumer_awareness?.program_suggestion}
                    </div>
                  </div>

                  <div className="glass p-7 rounded-[2rem] border border-cyan/10">
                    <div className="text-white font-bold text-xl mb-3">Policy & Compliance Support</div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-text-muted text-sm">
                        Verdict: <span className="text-white font-bold">{result.policy_compliance?.verdict}</span>
                      </div>
                      <div className="text-text-muted text-xs font-mono">
                        Region: {result.policy_compliance?.region}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {(result.policy_compliance?.checklist || []).map((c, i) => (
                        <motion.div
                          key={`pc-${i}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="text-text-muted text-sm leading-relaxed"
                        >
                          • {c}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="glass p-7 rounded-[2rem] border border-cyan/10">
                    <div className="text-white font-bold text-xl mb-3">Circular Product Design</div>
                    <div className="text-text-muted text-sm leading-relaxed mb-3">
                      {result.circular_product_design?.reuse_strategy}
                    </div>
                    <div className="space-y-2">
                      {(result.circular_product_design?.design_guidelines || []).map((g, i) => (
                        <motion.div
                          key={`cd-${i}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="text-text-muted text-sm leading-relaxed"
                        >
                          • {g}
                        </motion.div>
                      ))}
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

export default Waste;

