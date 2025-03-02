import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text3D, Center } from '@react-three/drei';

interface TypingText {
  text: string;
  position: THREE.Vector3;
  visibleChars: number;
  typingDelay: number;
  typingTimer: number;
  color: string;
}

interface BuildingConfig {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  color: string;
  texts: TypingText[];
}

const Building = ({ config }: { config: BuildingConfig }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textsRef = useRef<TypingText[]>(config.texts.map(t => ({
    ...t,
    visibleChars: 0,
    typingTimer: 0
  })));

  useFrame((state, delta) => {
    // Animate building emergence
    if (meshRef.current) {
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        config.scale.y,
        0.05
      );
    }

    // Animate text typing
    textsRef.current.forEach(text => {
      text.typingTimer += delta * 1000;
      if (text.typingTimer >= text.typingDelay) {
        text.typingTimer = 0;
        if (text.visibleChars < text.text.length) {
          text.visibleChars++;
        }
      }
    });
  });

  return (
    <group position={config.position}>
      {/* Building mesh */}
      <mesh ref={meshRef} scale={[config.scale.x, 0.1, config.scale.z]}>
        <boxGeometry />
        <meshStandardMaterial color={config.color} />
      </mesh>

      {/* Typing texts on building */}
      {textsRef.current.map((text, index) => (
        <Text3D
          key={index}
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.3}
          height={0.1}
          position={text.position}
          material-color={text.color}
        >
          {text.text.slice(0, text.visibleChars)}
        </Text3D>
      ))}
    </group>
  );
};

const Street = () => {
  // Street configuration
  const buildings: BuildingConfig[] = [
    {
      position: new THREE.Vector3(-5, 0, 0),
      scale: new THREE.Vector3(2, 8, 2),
      color: '#2c3e50',
      texts: [
        {
          text: 'NEURAL_NET',
          position: new THREE.Vector3(0, 4, 1),
          typingDelay: 100,
          typingTimer: 0,
          visibleChars: 0,
          color: '#00ff00'
        },
        {
          text: 'PORT:443',
          position: new THREE.Vector3(0, 3, 1),
          typingDelay: 150,
          typingTimer: 0,
          visibleChars: 0,
          color: '#00ff00'
        }
      ]
    },
    {
      position: new THREE.Vector3(0, 0, -3),
      scale: new THREE.Vector3(2, 12, 2),
      color: '#34495e',
      texts: [
        {
          text: 'DATA_FLOW',
          position: new THREE.Vector3(0, 6, 1),
          typingDelay: 120,
          typingTimer: 0,
          visibleChars: 0,
          color: '#00ff00'
        }
      ]
    },
    {
      position: new THREE.Vector3(5, 0, 0),
      scale: new THREE.Vector3(2, 10, 2),
      color: '#2c3e50',
      texts: [
        {
          text: 'SYS_STATUS',
          position: new THREE.Vector3(0, 5, 1),
          typingDelay: 80,
          typingTimer: 0,
          visibleChars: 0,
          color: '#00ff00'
        }
      ]
    }
  ];

  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Buildings */}
      {buildings.map((config, index) => (
        <Building key={index} config={config} />
      ))}

      {/* Street lights */}
      <pointLight position={[-5, 8, 5]} intensity={0.5} color="#00ff00" />
      <pointLight position={[5, 8, -5]} intensity={0.5} color="#00ff00" />
    </>
  );
};

const TypingStreetScene = () => {
  return (
    <Canvas
      camera={{ position: [10, 10, 10], fov: 75 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'black',
      }}
    >
      <ambientLight intensity={0.2} />
      <OrbitControls enableDamping />
      <fog attach="fog" args={['#000000', 5, 30]} />
      <Street />
    </Canvas>
  );
};

export default TypingStreetScene; 