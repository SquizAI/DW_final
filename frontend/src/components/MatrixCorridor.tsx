import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Curved surface that displays the Matrix effect
const CurvedSurface = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Custom shader for the matrix rain effect
  const shader = {
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2() }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      void main() {
        vec2 st = vUv;
        
        // Create vertical columns
        float columnWidth = 0.02;
        float column = floor(st.x / columnWidth);
        
        // Offset each column's time
        float columnOffset = random(vec2(column, 0.0)) * 10.0;
        float speed = 2.0;
        float t = time * speed + columnOffset;
        
        // Create rain drops
        float dropLength = 0.1;
        float dropOffset = mod(t + random(vec2(column, floor(st.y / dropLength))), 1.0);
        float dropY = mod(st.y + dropOffset, dropLength) / dropLength;
        
        // Make drops more distinct
        float drop = smoothstep(0.3, 0.7, dropY);
        
        // Add random brightness variation
        float brightness = random(vec2(column, floor(time * 10.0)));
        brightness = brightness * 0.5 + 0.5; // Keep minimum brightness
        
        // Combine for final color
        vec3 color = vec3(0.0, drop * brightness, 0.0);
        
        // Add glow
        float glow = smoothstep(0.4, 0.6, drop);
        color += vec3(0.0, 0.3, 0.0) * glow;
        
        gl_FragColor = vec4(color, 0.95);
      }
    `
  };

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value += delta;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]} rotation={[0, 0, 0]}>
      <planeGeometry args={[20, 8, 100, 100]} />
      <shaderMaterial
        ref={materialRef}
        args={[shader]}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Canvas-based text overlay
const TextOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Configure text style
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const texts = [
      { text: "WAKE_UP_NEO", x: canvas.width * 0.3, y: canvas.height * 0.4 },
      { text: "FOLLOW_RABBIT", x: canvas.width * 0.7, y: canvas.height * 0.3 },
      { text: "MATRIX_HAS_YOU", x: canvas.width * 0.5, y: canvas.height * 0.5 },
      { text: "KNOCK_KNOCK", x: canvas.width * 0.4, y: canvas.height * 0.6 }
    ];

    // Draw glowing text
    texts.forEach(({ text, x, y }) => {
      // Glow effect
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#00ff00';
      
      // Draw multiple times for stronger glow
      for (let i = 0; i < 3; i++) {
        ctx.fillText(text, x, y);
      }
    });

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Redraw text
      texts.forEach(({ text, x, y }) => {
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00ff00';
        for (let i = 0; i < 3; i++) {
          ctx.fillText(text, x, y);
        }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
};

// Enhanced particles
const MatrixParticles = () => {
  const count = 2000;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const speeds = new Float32Array(count);
  const opacities = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;     // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
    positions[i * 3 + 2] = Math.random() * -10;        // z
    sizes[i] = Math.random() * 0.1 + 0.05;
    speeds[i] = Math.random() * 2 + 1;
    opacities[i] = Math.random();
  }

  const particles = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (particles.current) {
      const positions = particles.current.geometry.attributes.position.array as Float32Array;
      const opacities = particles.current.geometry.attributes.opacity.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        // Update position
        positions[i * 3 + 2] += speeds[i] * delta;
        if (positions[i * 3 + 2] > 5) {
          positions[i * 3 + 2] = -10;
          opacities[i] = Math.random();
        }
        
        // Fade effect
        opacities[i] = Math.sin(opacities[i] * Math.PI) * 0.5 + 0.5;
      }
      
      particles.current.geometry.attributes.position.needsUpdate = true;
      particles.current.geometry.attributes.opacity.needsUpdate = true;
    }
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={count}
          array={opacities}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00ff00"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        vertexColors
        sizeAttenuation
      />
    </points>
  );
};

const MatrixScene = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'black' }}
      >
        <color attach="background" args={['#000000']} />
        
        {/* Scene Components */}
        <CurvedSurface />
        <MatrixParticles />

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom
            intensity={2}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            kernelSize={3}
          />
        </EffectComposer>

        {/* Controls */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
      <TextOverlay />
    </div>
  );
};

export default MatrixScene; 