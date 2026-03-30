import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Stars = ({ count = 3000 }) => {
  const points = useRef();
  const { mouse } = useThree();

  const [positions, sizes, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const col = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 800 * Math.pow(Math.random(), 0.5); // Focus towards origin
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      const rand = Math.random();
      if (rand < 0.8) {
        sz[i] = 1;
      } else if (rand < 0.95) {
        sz[i] = 2;
      } else {
        sz[i] = 3.5; // Large stars
      }

      // Slightly varied colors (cold blue, white, faint purple)
      const cRand = Math.random();
      if (cRand < 0.2) {
        col[i * 3] = 0.5; col[i * 3 + 1] = 0.8; col[i * 3 + 2] = 1; // Cyanish
      } else if (cRand < 0.4) {
        col[i * 3] = 0.8; col[i * 3 + 1] = 0.7; col[i * 3 + 2] = 1; // Purplish
      } else {
        col[i * 3] = 1; col[i * 3 + 1] = 1; col[i * 3 + 2] = 1; // White
      }
    }
    return [pos, sz, col];
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    
    points.current.rotation.y += 0.0001;
    points.current.rotation.x += 0.00005;
    
    // Mouse parallax
    const targetX = mouse.x * 0.1;
    const targetY = mouse.y * 0.1;
    points.current.rotation.x += (targetY - points.current.rotation.x) * 0.01;
    points.current.rotation.y += (targetX - points.current.rotation.y) * 0.01;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.5}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Nebula = () => {
  const spriteRef1 = useRef();
  const spriteRef2 = useRef();
  const spriteRef3 = useRef();

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (spriteRef1.current) {
        spriteRef1.current.position.x = 200 * Math.sin(time * 0.1);
        spriteRef1.current.position.y = 100 * Math.cos(time * 0.15);
    }
  });

  return (
    <group>
      <sprite ref={spriteRef1} position={[150, 50, -300]} scale={[400, 400, 1]}>
        <spriteMaterial map={texture} color="#00C2FF" transparent opacity={0.07} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={spriteRef2} position={[-200, -50, -400]} scale={[500, 500, 1]}>
        <spriteMaterial map={texture} color="#7B5EA7" transparent opacity={0.05} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={spriteRef3} position={[0, -200, -350]} scale={[450, 450, 1]}>
        <spriteMaterial map={texture} color="#0057FF" transparent opacity={0.04} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
};

const ShootingStars = ({ count = 10 }) => {
    const group = useRef();
    const stars = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            id: Math.random(),
            pos: [
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 1000,
                -Math.random() * 500
            ],
            speed: 0.5 + Math.random() * 2,
            opacity: 0
        }));
    }, [count]);

    return (
        <group ref={group}>
            {/* Simple shooting star implementation left for further polish */}
        </group>
    );
};

const StarfieldCanvas = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
      >
        <Stars count={isMobile ? 1200 : 3000} />
        <Nebula />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
};

export default React.memo(StarfieldCanvas);
