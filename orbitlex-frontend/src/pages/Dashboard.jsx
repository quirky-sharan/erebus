import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { 
  Activity, 
  Search, 
  ShieldCheck, 
  BarChart2, 
  History, 
  ArrowRight,
  TrendingDown,
  Globe,
  Radio,
  Zap,
  Box
} from 'lucide-react';
import gsap from 'gsap';

const StatCard = ({ title, value, unit, icon: Icon, colorClass, index }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 2,
      delay: 0.5 + index * 0.1,
      ease: "power2.out",
      onUpdate: () => setCount(Math.floor(obj.val))
    });
  }, [value, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6, boxShadow: "0 0 20px rgba(0, 194, 255, 0.2)" }}
      className="glass p-6 rounded-2xl flex items-center justify-between group transition-all"
    >
      <div>
        <h3 className="text-text-muted text-sm font-medium mb-2">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-display font-bold ${colorClass || 'text-white'}`}>
            {count.toLocaleString()}
          </span>
          <span className="text-text-muted text-xs font-mono">{unit}</span>
        </div>
      </div>
      <div className={`p-4 rounded-xl bg-void group-hover:scale-110 transition-transform ${colorClass || 'text-cyan'}`}>
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
};

const FeatureCTA = ({ title, desc, icon: Icon, path, colorClass }) => (
    <motion.div
        whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(0, 194, 255, 0.3)" }}
        className="glass p-8 rounded-3xl relative overflow-hidden group cursor-pointer"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br transition-all ${colorClass || 'from-cyan/20 to-transparent'} blur-3xl group-hover:scale-150`}></div>
        <Icon className={`w-12 h-12 mb-6 ${colorClass ? 'text-white' : 'text-cyan'}`} />
        <h3 className="text-2xl font-display font-bold text-white mb-3 tracking-wide">{title}</h3>
        <p className="text-text-muted mb-8 leading-relaxed">{desc}</p>
        <div className="flex items-center gap-2 text-cyan font-bold group-hover:translate-x-2 transition-transform">
            Launch Application <ArrowRight className="w-4 h-4" />
        </div>
    </motion.div>
);

const OrbitViz = () => {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden glass rounded-3xl border border-cyan/10">
      <div className="absolute inset-0 bg-void/50 pointer-events-none"></div>
      
      {/* Earth Center */}
      <div className="relative w-24 h-24 rounded-full bg-void border-[1px] border-cyan/40 flex items-center justify-center shadow-[0_0_50px_rgba(0,194,255,0.2)]">
        <Globe className="text-cyan w-12 h-12 opacity-80" />
        <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-cyan"
        />
      </div>

      {/* Orbit Rings and Satellites */}
      <div className="absolute w-[180px] h-[180px] rounded-full border border-cyan/10 pointer-events-none"></div>
      <div className="absolute w-[280px] h-[280px] rounded-full border border-cyan/10 pointer-events-none"></div>
      <div className="absolute w-[380px] h-[380px] rounded-full border border-cyan/10 pointer-events-none"></div>

      {/* Moving Satellites */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-[180px] h-[180px]"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_#00C2FF]" />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-[280px] h-[280px]"
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan/60" />
      </motion.div>

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute w-[380px] h-[380px]"
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orbit/60" />
      </motion.div>

      {/* Labels */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-cyan/60">
              <span className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_8px_#00C2FF]"></span>
              LEO Band Active
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-orbit/60">
              <span className="w-2 h-2 rounded-full bg-orbit"></span>
              MEO/GEO Band
          </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
    const stats = [
        { title: 'Active Satellites', value: 8542, unit: 'Objects', icon: Radio, colorClass: 'text-cyan' },
        { title: 'Compliance Checks', value: 3412, unit: 'Verified', icon: ShieldCheck, colorClass: 'text-green-400' },
        { title: 'Reports Generated', value: 129, unit: 'PDFs', icon: TrendingDown, colorClass: 'text-purple-400' },
        { title: 'Debris Tracked', value: 1240, unit: 'Threats', icon: Box, colorClass: 'text-gold' }
    ];

    const headingText = "Mission Control";

    return (
        <div className="min-h-screen bg-void pt-28 pb-20 px-6 overflow-x-hidden">
            <Navbar />
            <StarfieldCanvas />

            <div className="container mx-auto max-w-7xl relative z-10">
                <header className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <div className="flex mb-4">
                                {headingText.split("").map((char, index) => (
                                    <motion.span
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.5 }}
                                        className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white whitespace-pre"
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </div>
                            <p className="text-text-muted text-lg max-w-lg">
                                Real-time orbital intelligence and mission compliance monitoring system.
                            </p>
                        </div>
                        <div className="bg-card/40 border border-cyan/20 px-6 py-4 rounded-2xl flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                            <span className="text-sm font-mono text-cyan truncate">
                                SYSTEM STATUS: NOMINAL • LATENCY 24MS
                            </span>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {stats.map((s, i) => (
                        <StatCard key={i} {...s} index={i} />
                    ))}
                </div>

                {/* Main Dashboard Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass p-8 rounded-3xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                    <Activity className="text-cyan w-6 h-6" /> Live Space Traffic
                                </h2>
                                <button className="text-cyan text-sm font-mono hover:underline">VIEW FULL MAP</button>
                            </div>
                            <OrbitViz />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FeatureCTA 
                                title="Compliance Engine"
                                desc="Verify regulatory adherence across five international space debris mitigation frameworks."
                                icon={ShieldCheck}
                                path="/compliance"
                                colorClass="from-cyan/20 to-orbit/5"
                            />
                            <FeatureCTA 
                                title="Deorbit Predictor"
                                desc="Physics-based probabilistic models for predicting satellite atmospheric reentry timeline."
                                icon={Zap}
                                path="/deorbit"
                                colorClass="from-purple-500/20 to-nebula/5"
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="glass p-8 rounded-3xl h-full flex flex-col">
                            <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3">
                                <History className="text-cyan w-5 h-5" /> Operation History
                            </h2>
                            <div className="space-y-6 flex-1 overflow-y-auto max-h-[600px] pr-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group p-4 bg-void/50 border border-cyan/5 rounded-xl hover:border-cyan/20 transition-all cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-white font-bold group-hover:text-cyan transition-colors">STARLINK-3142</span>
                                            <span className="text-[10px] text-text-muted font-mono uppercase">14:24 UT</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan/10 text-cyan uppercase font-bold">LEO</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 uppercase font-bold">COMPLIANT</span>
                                            </div>
                                            <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-cyan translate-x-0 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <button className="w-full mt-8 py-3 glass rounded-xl text-text-muted hover:text-white transition-all text-sm font-bold">
                                VIEW ALL RECENT ACTIVITY
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <motion.div 
                    whileInView={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    viewport={{ once: true }}
                    className="p-12 glass rounded-[3rem] text-center relative overflow-hidden bg-gradient-to-r from-void to-card/50 border border-cyan/20"
                >
                    <div className="absolute top-0 right-0 p-8">
                        <Radio className="w-32 h-32 text-cyan/5" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Explore the Orbital Record.</h2>
                    <p className="text-text-muted text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Access live TLE data and metadata for over <span className="text-cyan font-bold">25,000</span> tracked orbital objects directly from the world's most trusted sources.
                    </p>
                    <div className="max-w-2xl mx-auto flex items-center glass p-2 rounded-2xl border-cyan/30 bg-void/30">
                        <Search className="w-6 h-6 text-cyan ml-4" />
                        <input 
                            type="text" 
                            placeholder="Enter satellite name or NORAD ID..." 
                            className="bg-transparent border-none focus:ring-0 text-white flex-1 p-4 text-lg font-display"
                        />
                        <button className="bg-cyan text-void font-bold px-8 py-4 rounded-xl hover:bg-white transition-all">
                            INITIALIZE SEARCH
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
