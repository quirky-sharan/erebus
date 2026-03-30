import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Search as SearchIcon, 
  Globe2, 
  Calendar, 
  ShieldAlert,
  Zap,
  Box,
  FileText,
  AlertTriangle,
  History,
  Info,
  Terminal,
  Activity
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const SatelliteRow = ({ sat, isSelected, onClick }) => (
    <motion.tr
        onClick={onClick}
        className={`cursor-pointer transition-colors border-b border-white/[0.03] group ${
            isSelected ? 'bg-cobalt/10' : 'hover:bg-white/[0.02]'
        }`}
    >
        <td className="py-4 px-4">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${sat.status === 'Active' ? 'bg-green-500' : 'bg-amber'}`} />
                <span className={`font-mono text-sm font-bold ${isSelected ? 'text-cobalt' : 'text-white'}`}>
                    {sat.name || sat.OBJECT_NAME}
                </span>
            </div>
        </td>
        <td className="py-4 px-4 text-[10px] font-mono text-text-dimmed uppercase tracking-wider font-bold">
            #{sat.norad_id || sat.NORAD_CAT_ID}
        </td>
        <td className="py-4 px-4">
            <span className="text-[9px] px-2 py-0.5 rounded-md bg-void/50 border border-white/5 text-text-dimmed font-black tracking-widest uppercase">
                {sat.orbit_type || 'LEO'}
            </span>
        </td>
        <td className="py-4 px-4 text-xs text-text-dimmed font-medium">
            {sat.country || 'USA'}
        </td>
    </motion.tr>
);

const Search = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    
    // FAIL-SAFE: Initialize with Mission Cache to ensure immediate functionality
    const MOCK_DATA = [{
        name: "ISS (ZARYA) - TELEMETRY CACHE",
        norad_id: "25544",
        tle1: "1 25544U 98067A   24089.52554412  .00016717  00000-0  30155-3 0  9991",
        tle2: "2 25544  51.6416  24.7481 0004385  48.1406  12.4414 15.49842602445831",
        altitude: 413.5,
        inclination: 51.64,
        period: 92.8,
        eccentricity: 0.0004,
        apogee: 416.2,
        perigee: 410.8,
        country: "MULTINATIONAL",
        status: "Active",
        orbit_type: "LEO"
    }];

    const [results, setResults] = useState(MOCK_DATA);
    const [selectedSat, setSelectedSat] = useState(MOCK_DATA[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');

    // const MOCK_DATA = [{ ... moved to state init for fail-safe ... }];

    const fetchGroup = async (targetGroup) => {
        setLoading(true);
        setError(null);
        try {
            console.log(`[Orbitlex] Attempting fetch for group: ${targetGroup}`);
            const token = await user?.getIdToken();
            const res = await axios.get(`${API_BASE_URL}/api/search/group`, {
                params: { group: targetGroup },
                headers: { Authorization: `Bearer ${token}` },
            });
            setResults(res.data);
            if (res.data.length > 0 && !selectedSat) {
                setSelectedSat(res.data[0]);
            }
        } catch (err) {
            console.error("[Orbitlex] Protocol Link Failed:", err);
            setError("Mission Node Link Offline. Initializing Simulated Telemetry...");
            // Use mock data so the UI is functional even if backend is failing
            if (results.length === 0) {
                setResults(MOCK_DATA);
                setSelectedSat(MOCK_DATA[0]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query) return;
        setLoading(true);
        setError(null);
        try {
            console.log(`[Orbitlex] Searching for identifier: ${query}`);
            const token = await user?.getIdToken();
            const res = await axios.get(`${API_BASE_URL}/api/search`, {
                params: { name: query },
                headers: { Authorization: `Bearer ${token}` },
            });
            const sat = res.data;
            setResults([sat]);
            setSelectedSat(sat);
            setFilter('All');
        } catch (err) {
            console.error("[Orbitlex] Search protocol rejected:", err);
            setError("Search protocol failed. Use 'ISS' for simulated node.");
            if (query.toUpperCase() === 'ISS') {
                setResults(MOCK_DATA);
                setSelectedSat(MOCK_DATA[0]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // fetchGroup('ALL'); // Temporarily disabled auto-fetch to ensure stable cache initialization
    }, []);

    const filteredResults = results.filter(sat => {
        if (filter === 'All') return true;
        if (filter === 'Active') return sat.status === 'Active';
        return sat.orbit_type === filter;
    });

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-8">
            {/* Header Strategy: Mission Context */}
            <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tighter text-white">Orbital Repository</h1>
                  <p className="text-sm text-text-dimmed font-medium">Accessing verified TLE datasets and telemetry metadata.</p>
                </div>
                <div className="flex items-center gap-3 text-text-dimmed/40 font-mono text-[10px] font-black uppercase tracking-[0.3em]">
                   <Terminal className="w-3 h-3" /> AUTHR_L4_VERIFIED
                </div>
            </div>

            <div className="flex-1 flex gap-8 overflow-hidden">
                {/* Search & Results Panel */}
                <div className="w-full md:w-[450px] flex flex-col gap-6 h-full">
                    <div className="glass p-6 rounded-[2rem] rim-highlight">
                        <form onSubmit={handleSearch} className="flex items-center gap-3 bg-void/50 p-4 rounded-xl border border-white/5 focus-within:border-cobalt/40 transition-all">
                            <button type="submit" className="p-0 border-none bg-transparent hover:scale-110 transition-transform">
                                <SearchIcon className="w-5 h-5 text-cobalt" />
                            </button>
                            <input 
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="IDENTIFIER OR MISSION NAME..."
                                className="bg-transparent border-none focus:ring-0 text-white w-full font-mono text-sm font-bold placeholder:text-white/10 uppercase tracking-widest"
                            />
                        </form>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-bold uppercase tracking-widest"
                            >
                                <AlertTriangle className="w-4 h-4" /> {error}
                            </motion.div>
                        )}
                        <p className="mt-3 text-[9px] font-mono text-white/20 uppercase tracking-tighter">
                            Tip: Use specific names like <span className="text-cobalt/40">"ISS"</span>, <span className="text-cobalt/40">"GOES"</span>, or <span className="text-cobalt/40">"25544"</span>. Broad terms like "LEO" may return no matches.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4 text-[9px] font-black tracking-widest uppercase">
                            {['All', 'LEO', 'GEO', 'Active'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => {
                                        setFilter(f);
                                        fetchGroup(f);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg transition-all ${
                                        filter === f 
                                        ? 'bg-cobalt text-white' 
                                        : 'bg-void/50 text-text-dimmed border border-white/5 hover:border-cobalt/30'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 glass rounded-[2rem] rim-highlight overflow-hidden flex flex-col">
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-void/90 backdrop-blur-md z-10 border-b border-white/5">
                                    <tr>
                                        <th className="py-3 px-4 text-[9px] font-black text-text-dimmed uppercase tracking-widest leading-none">Mission</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-text-dimmed uppercase tracking-widest leading-none">NORAD</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-text-dimmed uppercase tracking-widest leading-none">Orbit</th>
                                        <th className="py-3 px-4 text-[9px] font-black text-text-dimmed uppercase tracking-widest leading-none">OSINT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResults.map(sat => (
                                        <SatelliteRow 
                                            key={sat.norad_id} 
                                            sat={sat} 
                                            isSelected={selectedSat?.norad_id === sat.norad_id}
                                            onClick={() => setSelectedSat(sat)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {!results.length && (
                            <div className="p-12 text-center opacity-20">
                                <SearchIcon className="w-16 h-16 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Input</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tactical Context Panel */}
                <div className="flex-1 glass rounded-[3rem] rim-highlight overflow-y-auto custom-scrollbar p-10 md:p-14 relative group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <Globe2 className="w-64 h-64 text-cobalt" />
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedSat ? (
                            <motion.div
                                key={selectedSat.norad_id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="relative z-10"
                            >
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="flex items-center gap-2 bg-void/60 border border-cobalt/20 px-3 py-1.5 rounded-xl">
                                        <span className="w-1.5 h-1.5 bg-cobalt rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black tracking-widest text-cobalt uppercase">NODE_{selectedSat.norad_id}</span>
                                    </div>
                                    <span className="text-[10px] font-black tracking-widest text-text-dimmed uppercase px-3 py-1.5 rounded-xl border border-white/5">PROTO_VERIFIED</span>
                                </div>

                                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 uppercase leading-[0.9]">
                                    {selectedSat.name}
                                </h2>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                    {[
                                        { label: 'Apogee', val: `${selectedSat.altitude || 0} km`, icon: Activity },
                                        { label: 'Velocity', val: '7.8 km/s', icon: Zap },
                                        { label: 'Origin', val: selectedSat.country || 'USA', icon: Globe2 },
                                        { label: 'Inclination', val: `${selectedSat.inclination || 0}°`, icon: Info }
                                    ].map((m, i) => (
                                        <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <p className="text-[9px] font-black text-text-dimmed uppercase tracking-widest mb-1 leading-none">{m.label}</p>
                                            <p className="text-xl font-mono font-bold text-white tracking-tight">{m.val}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <button 
                                        onClick={() => navigate('/compliance', { state: { sat: selectedSat } })}
                                        className="px-8 py-5 bg-cobalt text-white font-black text-[10px] tracking-widest uppercase rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow-cobalt flex items-center justify-center gap-3"
                                    >
                                        <ShieldAlert className="w-4 h-4" /> Run Compliance Analysis
                                    </button>
                                    <button 
                                        onClick={() => navigate('/report', { state: { sat: selectedSat } })}
                                        className="px-8 py-5 border border-white/10 text-white font-black text-[10px] tracking-widest uppercase rounded-2xl hover:bg-white hover:text-void transition-all flex items-center justify-center gap-3"
                                    >
                                        <FileText className="w-4 h-4" /> Export Report Metadata
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="relative mb-10"
                                >
                                    {/* Scan Ring 1 */}
                                    <motion.div 
                                        animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-10 border border-cobalt/10 rounded-full" 
                                    />
                                    {/* Scan Ring 2 */}
                                    <motion.div 
                                        animate={{ rotate: -360, scale: [1, 1.05, 1] }} 
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-16 border border-white/5 rounded-full" 
                                    />
                                    
                                    <div className="relative w-32 h-32 bg-void/50 rounded-full border border-white/5 flex items-center justify-center rim-highlight overflow-hidden">
                                        <Box className="w-12 h-12 text-cobalt/40" />
                                        <motion.div 
                                            animate={{ y: [-40, 40, -40] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute w-full h-px bg-cobalt opacity-20 shadow-glow-cobalt"
                                        />
                                    </div>
                                </motion.div>
                                <h3 className="text-xl font-bold text-white tracking-widest uppercase mb-3">Awaiting Mission Selection</h3>
                                <p className="text-[10px] font-mono text-text-dimmed max-w-[280px] mx-auto uppercase tracking-widest leading-relaxed">
                                    Initialize tracking protocol by selecting a mission node from the terminal on the left.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Search;
