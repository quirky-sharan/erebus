import React, { useEffect, useRef } from 'react';

export const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const canvasRef = useRef(null);
  
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const particles = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
      
      // Spawn particle
      particles.current.push({
        x: e.clientX,
        y: e.clientY,
        vy: -Math.random() * 2,
        vx: (Math.random() - 0.5) * 2,
        life: 1,
        maxLife: 0.6 + Math.random() * 0.4
      });
      
      if (particles.current.length > 40) {
        particles.current.shift();
      }
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.tagName.toLowerCase() === 'a' || 
          target.tagName.toLowerCase() === 'button' || 
          target.closest('a') || target.closest('button')) {
        document.body.classList.add('cursor-hover');
      }
    };

    const handleMouseOut = (e) => {
      document.body.classList.remove('cursor-hover');
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const render = () => {
      // Setup canvas size
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Lerp ring
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;
      
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      
      // Draw particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1 / 60; // assume 60fps
        
        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }
        
        const r = 2; // radius
        const gradient = ctx.createLinearGradient(p.x - r, p.y - r, p.x + r, p.y + r);
        gradient.addColorStop(0, `rgba(0, 194, 255, ${p.life / p.maxLife})`);
        gradient.addColorStop(1, `rgba(123, 94, 167, ${p.life / p.maxLife})`);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Hide on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <>
      <div ref={dotRef} className="cursor-dot"></div>
      <div ref={ringRef} className="cursor-ring"></div>
      <canvas ref={canvasRef} id="particle-canvas"></canvas>
    </>
  );
};
