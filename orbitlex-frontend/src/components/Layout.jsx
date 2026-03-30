import React from 'react';
import { Sidebar } from './Sidebar';
import StarfieldCanvas from './StarfieldCanvas';

export const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-void text-white overflow-hidden selection:bg-cobalt/30 selection:text-white">
      {/* Background stays global */}
      <StarfieldCanvas />
      
      {/* Sidebar - Phase 3 Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 ml-[88px] md:ml-[280px] min-h-screen relative overflow-y-auto custom-scrollbar">
        {/* Subtle top gradient to ground the header */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-cobalt/5 to-transparent pointer-events-none -z-10" />
        
        <div className="p-8 md:p-12 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
