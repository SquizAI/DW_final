import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera, Text } from "@react-three/drei";
import * as THREE from "three";

enum Phase {
  Matrix = "matrix",
  Transition = "transition",
  Visualization = "visualization",
}

interface DropProps {
  initialPosition: THREE.Vector3;
  char: string;
  speed: number;
  phase: Phase;
  targetPosition?: THREE.Vector3;
}

const Drop: React.FC<DropProps> = ({ initialPosition, char, speed, phase, targetPosition }) => {
  const meshRef = useRef<THREE.Group>(null!);
  // Use a local vector to track position
  const pos = useRef(initialPosition.clone());
  const rotation = useRef(0);

  useFrame((state, delta) => {
    if (phase === Phase.Matrix) {
      // Simple falling behavior
      pos.current.y -= speed * delta;
      // Respawn at top if below threshold:
      if (pos.current.y < -state.viewport.height / 2) {
        pos.current.y = state.viewport.height / 2;
        pos.current.x = (Math.random() - 0.5) * state.viewport.width;
        pos.current.z = (Math.random() - 0.5) * 10;
      }
    } else if (phase === Phase.Transition && targetPosition) {
      // Smoothly interpolate position toward target
      pos.current.lerp(targetPosition, delta * 0.5);
      // Rotate drop for dramatic effect
      rotation.current += delta;
    }
    if (meshRef.current) {
      meshRef.current.position.copy(pos.current);
      meshRef.current.rotation.y = rotation.current;
    }
  });

  return (
    <group ref={meshRef}>
      <Text
        color={phase === Phase.Matrix ? "lime" : "cyan"}
        fontSize={1.2}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.2}
        outlineColor={phase === Phase.Matrix ? "black" : "blue"}
      >
        {char}
      </Text>
    </group>
  );
};

const Drops: React.FC<{ phase: Phase }> = ({ phase }) => {
  const drops = useMemo(() => {
    const arr = [];
    const count = 150; // number of drops
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < count; i++) {
      // Random starting position in 3D space
      const x = (Math.random() - 0.5) * 30;
      const y = Math.random() * 20;
      const z = (Math.random() - 0.5) * 20;
      const initialPosition = new THREE.Vector3(x, y, z);
      const char = characters.charAt(Math.floor(Math.random() * characters.length));
      // In transition we target a grid layout position.
      let targetPosition: THREE.Vector3 | undefined;
      if (phase !== Phase.Matrix) {
        const gridX = (i % 10) - 5;
        const gridY = -Math.floor(i / 10) + 5;
        // set z to zero for grid
        targetPosition = new THREE.Vector3(gridX * 2, gridY * 2, 0);
      }
      arr.push({ initialPosition, char, speed: 5 + Math.random() * 2, phase, targetPosition });
    }
    return arr;
  }, [phase]);
  return (
    <>
      {drops.map((drop, index) => (
        <Drop key={index} {...drop} phase={phase} />
      ))}
    </>
  );
};

const VisualizationNodes: React.FC = () => {
  const nodes = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      arr.push(new THREE.Vector3(x, y, z));
    }
    return arr;
  }, []);
  return (
    <group>
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="hotpink" emissive="hotpink" emissiveIntensity={1} />
        </mesh>
      ))}
      {/* Connections as lines */}
      <lineSegments>
        <bufferGeometry attach="geometry">
          {(() => {
            const points: THREE.Vector3[] = [];
            for (let i = 0; i < nodes.length - 1; i++) {
              points.push(nodes[i]);
              points.push(nodes[i + 1]);
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            return geometry.attributes.position.array;
          })()}
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="aqua" linewidth={2} />
      </lineSegments>
    </group>
  );
};

const MiamiMatrixRain3D: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(Phase.Matrix);
  // Cycle phases: Matrix for 5s, Transition for 3s, then Visualization for 5s.
  const phaseTimerRef = useRef(0);
  useFrame((state, delta) => {
    phaseTimerRef.current += delta * 1000; // milliseconds elapsed
    if (phase === Phase.Matrix && phaseTimerRef.current > 5000) {
      setPhase(Phase.Transition);
      phaseTimerRef.current = 0;
    } else if (phase === Phase.Transition && phaseTimerRef.current > 3000) {
      setPhase(Phase.Visualization);
      phaseTimerRef.current = 0;
    } else if (phase === Phase.Visualization && phaseTimerRef.current > 5000) {
      setPhase(Phase.Matrix);
      phaseTimerRef.current = 0;
    }
  });
  return (
    <Canvas style={{ background: "black" }}>
      {/* Use an Orthographic Camera for isometric view */}
      <OrthographicCamera makeDefault position={[0, 0, 50]} zoom={50} />
      <ambientLight intensity={0.5} />
      {phase !== Phase.Visualization && <Drops phase={phase} />}
      {phase === Phase.Visualization && <VisualizationNodes />}
    </Canvas>
  );
};

export default MiamiMatrixRain3D; 