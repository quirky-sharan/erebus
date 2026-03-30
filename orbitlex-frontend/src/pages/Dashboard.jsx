import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ShieldCheck, 
  Radio, 
  History, 
  ArrowRight,
  Globe,
  Zap,
  Box,
  Cpu,
  Database,
  Terminal
} from 'lucide-react';
import gsap from 'gsap';

const StatCard = ({ title, value, unit, icon: Icon, colorClass, index }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1.5,
      delay: index * 0.1,
      ease: "power2.out",
      onUpdate: () => setCount(Math.floor(obj.val))
    });
  }, [value, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass p-6 rounded-2xl rim-highlight group relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dimmed mb-1">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">
              {count.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono font-bold text-cobalt/60 uppercase">{unit}</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-void/50 border border-white/5 text-cobalt group-hover:border-cobalt/40 transition-all">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 w-full h-1 bg-white/[0.03] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '70%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-cobalt to-indigo-400 opacity-60"
          />
      </div>
    </motion.div>
  );
};

const ControlModule = ({ title, desc, icon: Icon, color }) => (
    <motion.div
        whileHover={{ x: 4 }}
        className="flex items-center gap-5 p-5 glass rounded-2xl rim-highlight group cursor-pointer"
    >
        <div className={`w-12 h-12 rounded-xl bg-void/50 border border-white/5 flex items-center justify-center text-white/80 group-hover:border-${color}/40 transition-all`}>
            <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-bold text-white group-hover:text-cobalt transition-colors">{title}</h4>
            <p className="text-[11px] text-text-dimmed leading-tight">{desc}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-cobalt group-hover:translate-x-1 transition-all" />
    </motion.div>
);

const OrbitViz = () => {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden bg-void/20 rounded-[2.5rem] border border-white/5 rim-highlight group">
      {/* Precision Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--color-cobalt) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* Earth Core */}
      <div className="relative w-32 h-32 rounded-full bg-void border border-white/10 flex items-center justify-center shadow-[0_0_100px_rgba(46,91,255,0.05)]">
        <Globe className="text-white/20 w-16 h-16" />
        <div className="absolute inset-0 rounded-full border border-cobalt/20 animate-pulse" />
      </div>

      {/* Trajectories */}
      {[240, 320, 400].map((size, i) => (
          <div key={i} className="absolute rounded-full border border-white/[0.03]" style={{ width: size, height:size }} />
      ))}

      {/* Active Assets */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute w-[240px] h-[240px]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cobalt shadow-[0_0_10px_rgba(46,91,255,1)]" />
      </motion.div>

      <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[320px] h-[320px]">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber shadow-[0_0_8px_rgba(245,154,27,1)]" />
      </motion.div>

      {/* Legend */}
      <div className="absolute bottom-10 left-10 flex gap-6">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-text-dimmed uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cobalt" /> Operational
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-text-dimmed uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" /> Potential Risk
          </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
    const stats = [
        { title: 'Global Coverage', value: 98.4, unit: '%', icon: Globe, index: 0 },
        { title: 'System Uptime', value: 99.9, unit: '%', icon: Cpu, index: 1 },
        { title: 'Active Relays', value: 142, unit: 'Nodes', icon: Radio, index: 2 },
        { title: 'Data Throughput', value: 4.8, unit: 'GB/S', icon: Database, index: 3 }
    ];

    return (
        <div className="space-y-10">
            {/* Header Strategy: Professional & Clean */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2 px-3 py-1 bg-cobalt/5 border border-cobalt/10 rounded-full w-fit">
                        <span className="w-2 h-2 rounded-full bg-cobalt animate-pulse" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-cobalt uppercase">System Status: Nominal</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Orbital Control Center</h1>
                </div>
                
                <div className="flex items-center gap-4 text-right">
                    <div className="px-5 py-3 glass rounded-2xl rim-highlight">
                        <p className="text-[9px] font-black text-text-dimmed uppercase tracking-widest leading-none mb-1">Local Time</p>
                        <p className="text-lg font-mono font-bold text-white leading-none tracking-tight">14:52:08 <span className="text-sm text-text-dimmed">UTC</span></p>
                    </div>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s) => (
                    <StatCard key={s.title} {...s} />
                ))}
            </div>

            {/* Main Operational Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Intelligence Section */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="glass p-8 rounded-[3rem] rim-highlight relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <Activity className="text-cobalt w-5 h-5" /> Real-time Telemetry
                            </h2>
                            <div className="flex gap-2">
                                <button className="px-4 py-1.5 rounded-lg bg-white/[0.03] text-[9px] font-black uppercase text-white/60 hover:text-white transition-colors border border-white/5">Layer: LEO</button>
                                <button className="px-4 py-1.5 rounded-lg bg-cobalt/10 text-[9px] font-black uppercase text-cobalt border border-cobalt/20">Expand Console</button>
                            </div>
                        </div>
                        <OrbitViz />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ControlModule 
                            title="Compliance Engine"
                            desc="Protocol verification for debris mitigation."
                            icon={ShieldCheck}
                            color="cobalt"
                        />
                        <ControlModule 
                            title="Signal Analysis"
                            desc="Deep spectrum monitoring and relay health."
                            icon={Radio}
                            color="amber"
                        />
                    </div>
                </div>

                {/* Tactical Feed & Authorization */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="glass p-8 rounded-[3rem] rim-highlight flex-1 flex flex-col min-h-[500px]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-white flex items-center gap-3">
                                <Terminal className="text-cobalt w-5 h-5" /> Terminal Logs
                            </h2>
                            <span className="text-[10px] font-mono text-text-dimmed px-2 py-1 bg-white/[0.03] rounded">LIVE FEED</span>
                        </div>
                        
                        <div className="space-y-3 flex-1">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.03] rounded-xl group hover:border-cobalt/20 transition-all cursor-pointer">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white/80 tracking-tight">SIG-74-{1000 + i}</span>
                                        <span className="text-[9px] font-mono text-cobalt">STABLE</span>
                                    </div>
                                    <p className="text-[10px] text-text-dimmed font-mono">Uplink established at 14:2{i} UTC</p>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-8 py-4 glass border-white/5 rounded-2xl text-[10px] font-black tracking-widest text-text-dimmed uppercase hover:text-white hover:border-cobalt/40 transition-all">
                            Export Log History
                        </button>
                    </div>

                    <div className="glass p-10 rounded-[3rem] rim-highlight bg-gradient-to-br from-cobalt/10 to-transparent">
                        <div className="w-12 h-12 rounded-xl bg-cobalt flex items-center justify-center mb-6 shadow-glow-cobalt">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Priority Action</h3>
                        <p className="text-xs text-text-dimmed mb-8 leading-relaxed">
                            System detected 4 unresolved deorbit anomalies. Immediate protocol review required.
                        </p>
                        <button className="w-full py-4 bg-white text-void font-black text-[10px] tracking-widest uppercase rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                            Initiate Protocol
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
