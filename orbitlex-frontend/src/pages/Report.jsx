import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { useAuth } from '../hooks/useAuth';
import { Loader2, AlertTriangle, FileText } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Section = ({ title, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="glass p-7 rounded-[2rem] border border-cyan/10"
  >
    <h2 className="text-white font-display text-xl font-bold mb-3">{title}</h2>
    <div className="text-text-muted leading-relaxed text-sm whitespace-pre-wrap">{children}</div>
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
      if (!token) throw new Error('Missing auth token');

      // 1) Deorbit
      const deorbitRes = await axios.post(
        `${API_BASE_URL}/api/deorbit`,
        {
          altitude: Number(sat.altitude),
          inclination: Number(sat.inclination),
          mass: 500,
          area: 5,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2) Debris
      const debrisRes = await axios.post(
        `${API_BASE_URL}/api/debris`,
        sat,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3) Compliance (uses years_mean from deorbit)
      const complianceRes = await axios.post(
        `${API_BASE_URL}/api/compliance`,
        {
          sat_data: sat,
          deorbit_years: Number(deorbitRes.data.years_mean),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4) Narrative report
      const reportRes = await axios.post(
        `${API_BASE_URL}/api/report`,
        {
          sat_data: sat,
          compliance: complianceRes.data,
          deorbit: deorbitRes.data,
          debris: debrisRes.data,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReport(reportRes.data);
    } catch {
      setError('Failed to generate report.');
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
            <FileText className="w-6 h-6 text-cyan" />
            <h1 className="text-4xl font-display font-bold text-white">Mission Report Preview</h1>
          </div>
          <p className="text-text-muted max-w-2xl">
            Groq-powered narrative with RAG-grounded compliance context.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass p-8 rounded-[2.5rem] border border-cyan/10 flex items-center justify-center gap-3 mb-8"
            >
              <Loader2 className="w-6 h-6 animate-spin text-cyan" />
              <span className="text-text-muted font-mono">Generating report…</span>
            </motion.div>
          ) : null}

          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass p-8 rounded-[2.5rem] border border-cyan/10 mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-gold" />
                <h2 className="text-white font-bold">Report generation failed</h2>
              </div>
              <p className="text-text-muted">{error}</p>
            </motion.div>
          ) : null}

          {report ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Section title="Executive Summary">{report.executive_summary}</Section>
              <Section title="Compliance Narrative">{report.compliance_narrative}</Section>
              <Section title="Deorbit Analysis">{report.deorbit_analysis}</Section>
              <Section title="Debris Assessment">{report.debris_assessment}</Section>
              <Section title="Recommendations">{report.recommendations}</Section>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Report;

