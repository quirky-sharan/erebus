import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Search as SearchIcon, 
  Filter, 
  ChevronRight, 
  Globe2, 
  Calendar, 
  Tag, 
  Info,
  ShieldAlert,
  Zap,
  Box,
  FileText,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const SatelliteCard = ({ sat, isSelected, onClick }) => (
    <motion.div
        layout
        whileHover={{ scale: 1.02, x: 4 }}
        onClick={onClick}
        className={`p-4 rounded-xl cursor-pointer transition-all border ${
            isSelected 
            ? 'glass border-cyan/60 bg-cyan/10 shadow-[0_0_15px_rgba(0,194,255,0.2)]' 
            : 'bg-void/40 border-cyan/10 hover:border-cyan/30'
        } mb-3`}
    >
        <div className="flex justify-between items-start mb-2">
            <h3 className={`font-bold font-display ${isSelected ? 'text-cyan' : 'text-white'}`}>
                {sat.name || sat.OBJECT_NAME}
            </h3>
            <span className="text-[10px] font-mono text-text-muted px-1.5 py-0.5 rounded bg-card/60">
                #{sat.norad_id || sat.NORAD_CAT_ID}
            </span>
        </div>
        <div className="flex gap-2 mb-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-void text-cyan/80 uppercase font-mono border border-cyan/10">
                {sat.orbit_type || 'LEO'}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded bg-void uppercase font-mono border ${
                sat.status === 'Active' ? 'text-green-400 border-green-500/20' : 'text-gold border-gold/20'
            }`}>
                {sat.status || 'Active'}
            </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-text-muted">
            <Globe2 className="w-3 h-3" />
            {sat.country || 'USA'} • {sat.launch_year || '2022'}
        </div>
    </motion.div>
);

const Search = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedSat, setSelectedSat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');

    const displayResults = results.filter((s) => {
        if (filter === 'All') return true;
        if (filter === 'LEO') return s.altitude < 2000;
        if (filter === 'MEO') return s.altitude >= 2000 && s.altitude < 35786;
        if (filter === 'GEO') return s.altitude >= 35786;
        if (filter === 'Active') return (s.status || '').toLowerCase() === 'active';
        if (filter === 'Defunct') return (s.status || '').toLowerCase() !== 'active';
        return true;
    });

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query) return;

        setLoading(true);
        setError(null);
        try {
            const token = await user.getIdToken();

            const res = await axios.get(`${API_BASE_URL}/api/search`, {
                params: { name: query },
                headers: { Authorization: `Bearer ${token}` },
            });

            const sat = res.data;

            // Derive UI-friendly fields (backend can be extended later).
            const altitude = Number(sat.altitude || 0);
            const orbit_type = altitude < 2000 ? 'LEO' : altitude < 35786 ? 'MEO' : 'GEO';
            const launch_year =
                typeof sat.launch_date === 'string' && sat.launch_date.length >= 4
                    ? sat.launch_date.slice(0, 4)
                    : 'Unknown';

            const normalized = {
                ...sat,
                orbit_type,
                launch_year,
            };
            setResults([normalized]);
            setSelectedSat(normalized);
        } catch (err) {
            setError("Failed to fetch satellite data.");
            setResults([]);
            setSelectedSat(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-void pt-28 pb-20 px-6 overflow-hidden">
            <Navbar />
            <StarfieldCanvas />

            <div className="container mx-auto max-w-7xl h-[calc(100vh-180px)] flex flex-col md:flex-row gap-8 relative z-10">
                {/* Search Panel */}
                <div className="w-full md:w-[400px] flex flex-col h-full">
                    <div className="glass p-6 rounded-3xl mb-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left duration-500"></div>
                        <form onSubmit={handleSearch} className="flex items-center gap-3 bg-void/50 p-3 rounded-xl border border-cyan/10 focus-within:border-cyan/40 transition-all">
                            <SearchIcon className="w-5 h-5 text-text-muted" />
                            <input 
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Satellite name or ID..."
                                className="bg-transparent border-none focus:ring-0 text-white w-full font-display"
                            />
                        </form>

                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                            {['All', 'LEO', 'MEO', 'GEO', 'Active', 'Defunct'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                                        filter === f ? 'bg-cyan text-void' : 'bg-void text-text-muted border border-cyan/10 hover:border-cyan/30'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <motion.div 
                                        key={`skeleton-${i}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-28 glass rounded-xl mb-3 animate-pulse"
                                    />
                                ))
                            ) : displayResults.length > 0 ? (
                                displayResults.map((sat, i) => (
                                    <SatelliteCard 
                                        key={sat.norad_id} 
                                        sat={sat} 
                                        isSelected={selectedSat?.norad_id === sat.norad_id}
                                        onClick={() => setSelectedSat(sat)}
                                    />
                                ))
                            ) : query && !loading ? (
                                <div className="text-center py-12">
                                    <AlertTriangle className="w-12 h-12 text-gold mx-auto mb-4 opacity-50" />
                                    <p className="text-text-muted italic">No satellites found matching your search.</p>
                                </div>
                            ) : (
                                <div className="text-center py-12 opacity-50">
                                    <SearchIcon className="w-16 h-16 text-cyan/20 mx-auto mb-4" />
                                    <p className="text-text-muted max-w-[200px] mx-auto">Discover orbital objects by name, NORAD ID, or mission type.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="flex-1 h-full">
                    <AnimatePresence mode="wait">
                        {selectedSat ? (
                            <motion.div
                                key={selectedSat.norad_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass rounded-[2.5rem] h-full overflow-y-auto p-8 relative md:p-12"
                            >
                                <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
                                    <div className="max-w-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-cyan/10 text-cyan text-xs font-bold px-2 py-1 rounded border border-cyan/20">
                                                NORAD ID: {selectedSat.norad_id}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded border ${
                                                selectedSat.status === 'Active' 
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                                : 'bg-gold/10 text-gold border-gold/20'
                                            }`}>
                                                {selectedSat.status}
                                            </span>
                                        </div>
                                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight leading-none">
                                            {selectedSat.name}
                                        </h1>
                                        <p className="text-text-muted text-lg font-display flex items-center gap-3">
                                            Operator: <span className="text-white font-medium">{selectedSat.operator}</span> • Country: <span className="text-white font-medium">{selectedSat.country}</span>
                                        </p>
                                    </div>

                                    <div className="w-full lg:w-fit flex flex-wrap gap-4">
                                        <button
                                            onClick={() => navigate('/compliance', { state: { sat: selectedSat } })}
                                            className="flex-1 lg:flex-none glass border-cyan/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-cyan hover:text-void transition-all flex items-center justify-center gap-2"
                                        >
                                            <ShieldAlert className="w-4 h-4" /> Run Compliance
                                        </button>
                                        <button
                                            onClick={() => navigate('/report', { state: { sat: selectedSat } })}
                                            className="flex-1 lg:flex-none bg-cyan text-void font-bold px-6 py-3 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" /> Generate Report
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                    {[
                                        { label: 'Altitude', val: selectedSat.altitude, unit: 'KM', icon: Globe2 },
                                        { label: 'Inclination', val: selectedSat.inclination, unit: 'DEG', icon: Tag },
                                        { label: 'Core Mission', val: 'Telecommunications', unit: '', icon: Info },
                                        { label: 'Launch System', val: 'Falcon 9 v1.2', unit: '', icon: Calendar },
                                        { label: 'Eccentricity', val: '0.0001', unit: '', icon: Activity },
                                        { label: 'Orbital Period', val: '95.1', unit: 'MIN', icon: Zap }
                                    ].map((stat, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-void/40 border border-cyan/5 p-5 rounded-2xl group hover:border-cyan/20 transition-all"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 rounded-lg bg-card text-cyan group-hover:scale-110 transition-transform">
                                                    <stat.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs uppercase tracking-widest text-text-muted font-bold font-mono">{stat.label}</span>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-display font-bold text-white">{stat.val}</span>
                                                <span className="text-[10px] font-mono text-cyan/60">{stat.unit}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div
                                        onClick={() => navigate('/deorbit', { state: { sat: selectedSat } })}
                                        className="glass bg-void/20 border-cyan/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-cyan/30 transition-all"
                                    >
                                        <Zap className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-125 transition-transform" />
                                        <h4 className="font-bold mb-1">Deorbit Predictor</h4>
                                        <p className="text-[10px] text-text-muted">Calculate reentry timeline</p>
                                    </div>
                                    <div
                                        onClick={() => navigate('/debris', { state: { sat: selectedSat } })}
                                        className="glass bg-void/20 border-cyan/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-cyan/30 transition-all"
                                    >
                                        <Box className="w-8 h-8 text-gold mb-4 group-hover:scale-125 transition-transform" />
                                        <h4 className="font-bold mb-1">Debris Simulator</h4>
                                        <p className="text-[10px] text-text-muted">Analyze collision risks</p>
                                    </div>
                                    <div className="glass bg-void/20 border-cyan/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-cyan/30 transition-all">
                                        <Globe2 className="w-8 h-8 text-cyan mb-4 group-hover:scale-125 transition-transform" />
                                        <h4 className="font-bold mb-1">Band Mapping</h4>
                                        <p className="text-[10px] text-text-muted">View orbital placement</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full glass rounded-[2.5rem] flex items-center justify-center border border-dashed border-cyan/20">
                                <div className="text-center">
                                    <div className="relative mb-6 inline-block">
                                        <Globe2 className="w-24 h-24 text-cyan/20" />
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 border-2 border-dashed border-cyan/20 rounded-full"
                                        />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-white mb-2">No Satellite Selected</h2>
                                    <p className="text-text-muted max-w-xs mx-auto">Select a mission from the results to view detailed orbital parameters and analysis.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Search;
