import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Stars = ({ count = 4000 }) => {
  const points = useRef();
  const { mouse } = useThree();

  const [positions, sizes, colors, sparkle] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const spk = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 900 * Math.pow(Math.random(), 0.5);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      sz[i] = Math.random() < 0.95 ? 0.8 : 2.2;
      spk[i] = Math.random(); // Initial sparkle phase

      const cRand = Math.random();
      if (cRand < 0.1) {
        col[i * 3] = 0.7; col[i * 3 + 1] = 0.8; col[i * 3 + 2] = 1.0; // Cool Blue
      } else if (cRand < 0.2) {
        col[i * 3] = 1.0; col[i * 3 + 1] = 0.9; col[i * 3 + 2] = 0.8; // Faint Warm
      } else {
        col[i * 3] = 1; col[i * 3 + 1] = 1; col[i * 3 + 2] = 1; // Pure White
      }
    }
    return [pos, sz, col, spk];
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    const time = state.clock.getElapsedTime();
    
    points.current.rotation.y += 0.00008;
    
    // Smooth mouse parallax
    const targetX = mouse.x * 0.08;
    const targetY = mouse.y * 0.08;
    points.current.rotation.x += (targetY - points.current.rotation.x) * 0.02;
    points.current.rotation.y += (targetX - points.current.rotation.y) * 0.02;

    // Simple scintillation simulation
    const material = points.current.material;
    material.opacity = 0.6 + Math.sin(time * 2) * 0.2;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.7}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const AtmosphericHaze = () => {
  return (
    <mesh position={[0, -280, -200]} rotation={[-Math.PI / 2.2, 0, 0]}>
      <planeGeometry args={[1200, 1000]} />
      <meshBasicMaterial 
        color="#2E5BFF" 
        transparent 
        opacity={0.08} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

const NebulaCluster = () => {
  const group = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (group.current) {
        group.current.rotation.z = time * 0.01;
    }
  });

  return (
    <group ref={group}>
        <mesh position={[200, 100, -500]}>
            <sphereGeometry args={[300, 32, 32]} />
            <meshBasicMaterial color="#1E293B" transparent opacity={0.03} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
        </mesh>
        <mesh position={[-300, -200, -600]}>
            <sphereGeometry args={[400, 32, 32]} />
            <meshBasicMaterial color="#2E5BFF" transparent opacity={0.02} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
        </mesh>
    </group>
  );
};

const StarfieldCanvas = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-[#05070A]">
      <Canvas camera={{ position: [0, 0, 1], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <Stars count={4000} />
        <NebulaCluster />
        <AtmosphericHaze />
        <ambientLight intensity={1} />
      </Canvas>
    </div>
  );
};

export default React.memo(StarfieldCanvas);

