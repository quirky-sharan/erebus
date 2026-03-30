import React, { useEffect, useRef } from 'react';

export const CustomCursor = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const particles = useRef([]);
  const requestRef = useRef();

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      // Update immediate cursor dot position via CSS variables
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
      
      // Spawn subtle particles sparingly
      if (Math.random() > 0.3) {
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          vy: -Math.random() * 1.5,
          vx: (Math.random() - 0.5) * 1.5,
          life: 1.0,
          size: 1 + Math.random() * 2
        });
      }
      
      if (particles.current.length > 30) {
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
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      
      // Handle resize
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Smooth lerp for the ring
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;
      
      // Update ring position via CSS variables
      document.documentElement.style.setProperty('--cursor-ring-x', `${ring.current.x}px`);
      document.documentElement.style.setProperty('--cursor-ring-y', `${ring.current.y}px`);
      
      // Draw refined particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;
        
        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 194, 255, ${p.life * 0.5})`;
        ctx.fill();
      }
      
      requestRef.current = requestAnimationFrame(render);
    };
    
    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // Hide on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <>
      <div className="cursor-dot"></div>
      <div className="cursor-ring"></div>
      <canvas ref={canvasRef} id="particle-canvas"></canvas>
    </>
  );
};

