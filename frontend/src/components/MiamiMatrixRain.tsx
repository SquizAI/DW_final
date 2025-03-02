import { useRef, useEffect } from 'react';
import { easeInOutCubic } from '../utils/animations';

// Enhanced color system for both Matrix and Data visualization
const COLORS = {
  matrix: {
    head: '#ffffff',      // Pure white for lead character
    bright: '#00ff41',    // Iconic Matrix green
    mid: '#00cc33',      // Mid-level green
    dark: '#00802b',     // Dark green for deep trails
    glow: '#0fff41',     // Bright green glow
  },
  data: {
    pipeline: '#2cd9e6',  // Turquoise for data pipelines
    aiNode: '#f72ecd',    // Hot pink for AI nodes
    analytics: '#ffcb17', // Bright yellow for analytics
    quality: '#00ffff',   // Cyan for quality indicators
    error: '#ff0055',     // Red for errors
    success: '#00ff99',   // Green for success
  },
  black: '#000000'
} as const;

interface MatrixDrop {
  x: number;
  y: number;
  z: number;            // For isometric positioning
  speed: number;
  chars: string[];
  head: number;
  length: number;
  glowIntensity: number;
  // Morphing properties
  targetX?: number;
  targetY?: number;
  targetZ?: number;
  type?: 'pipeline' | 'ai' | 'analytics' | 'quality';
  morphProgress: number;
  isTransitioning: boolean;
}

interface DataNode {
  x: number;
  y: number;
  z: number;
  type: 'pipeline' | 'ai' | 'analytics' | 'quality';
  connections: number[];
  energy: number;
  processedData: number;
  quality: number;
}

const MiamiMatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<MatrixDrop[]>([]);
  const nodesRef = useRef<DataNode[]>([]);
  const phaseRef = useRef<'matrix' | 'transition' | 'data'>('matrix');
  const timeRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CONFIG = {
      fontSize: 16,
      baseSpeed: 1.2,
      minLength: 14,
      maxLength: 30,
      glowStrength: 8,
      maxGlowStrength: 20,
      trailPower: 0.92,
      charChangeFreq: 0.02,
      brightCharCount: 3,
      // Visualization config
      nodeCount: 12,
      pipelineWidth: 3,
      transitionDuration: 3000,
      gridSize: 50,
      isometricAngle: Math.PI / 6,
      // Analytics config
      dataFlowSpeed: 2,
      pulseFrequency: 0.05,
      qualityThreshold: 0.8
    };

    const MATRIX_CHARS = '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ';
    const DATA_CHARS = '01▲▼→←∑∫√∂∆πΩ∞≈≠≤≥';

    // Isometric projection helpers
    const isoProject = (x: number, y: number, z: number) => ({
      screenX: canvas.width/2 + (x - z) * Math.cos(CONFIG.isometricAngle),
      screenY: canvas.height/2 + (x + z) * Math.sin(CONFIG.isometricAngle) - y
    });

    const createDataNode = (type: DataNode['type']): DataNode => ({
      x: (Math.random() - 0.5) * canvas.width * 0.8,
      y: (Math.random() - 0.5) * canvas.height * 0.8,
      z: (Math.random() - 0.5) * 200,
      type,
      connections: [],
      energy: Math.random(),
      processedData: 0,
      quality: 0.7 + Math.random() * 0.3
    });

    const initNodes = () => {
      const nodes: DataNode[] = [];
      // Create pipeline nodes
      for (let i = 0; i < CONFIG.nodeCount; i++) {
        nodes.push(createDataNode(
          i % 4 === 0 ? 'ai' :
          i % 4 === 1 ? 'analytics' :
          i % 4 === 2 ? 'quality' : 'pipeline'
        ));
      }
      // Create connections
      nodes.forEach((node, i) => {
        const nextIdx = (i + 1) % nodes.length;
        node.connections.push(nextIdx);
        if (i % 3 === 0 && i < nodes.length - 2) {
          node.connections.push((i + 2) % nodes.length);
        }
      });
      return nodes;
    };

    const createDrop = (x?: number): MatrixDrop => ({
      x: x ?? Math.random() * canvas.width,
      y: Math.random() * -100,
      z: 0,
      speed: CONFIG.baseSpeed + Math.random() * 0.8,
      chars: Array(Math.floor(Math.random() * (CONFIG.maxLength - CONFIG.minLength) + CONFIG.minLength))
        .fill('').map(() => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]),
      head: 0,
      length: CONFIG.maxLength,
      glowIntensity: 0.5 + Math.random() * 0.5,
      morphProgress: 0,
      isTransitioning: false
    });

    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.font = `bold ${CONFIG.fontSize}px "Courier New", monospace`;
      
      const columns = Math.floor(canvas.width / (CONFIG.fontSize * 0.7));
      dropsRef.current = Array(columns).fill(null).map((_, i) => 
        createDrop(i * CONFIG.fontSize * 0.7)
      );
      nodesRef.current = initNodes();
    };

    const drawCharacter = (
      char: string,
      x: number,
      y: number,
      color: string,
      alpha: number,
      glowSize: number,
      glowIntensity: number = 1,
      scale: number = 1,
      rotation: number = 0
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = color;
      ctx.shadowBlur = glowSize;
      ctx.fillStyle = color;

      if (rotation !== 0) {
        ctx.translate(x + CONFIG.fontSize/2, y);
        ctx.rotate(rotation);
        ctx.translate(-(x + CONFIG.fontSize/2), -y);
      }

      for (let i = 0; i < glowIntensity; i++) {
        if (scale !== 1) {
          ctx.setTransform(scale, 0, 0, scale, x + CONFIG.fontSize/2, y);
          ctx.fillText(char, -CONFIG.fontSize/2, 0);
        } else {
          ctx.fillText(char, x, y);
        }
      }
      
      ctx.restore();
    };

    const drawDataStructures = () => {
      const nodes = nodesRef.current;
      
      // Draw connections first
      ctx.lineWidth = CONFIG.pipelineWidth;
      nodes.forEach(node => {
        const start = isoProject(node.x, node.y, node.z);
        node.connections.forEach(targetIdx => {
          const target = nodes[targetIdx];
          const end = isoProject(target.x, target.y, target.z);
          
          // Create gradient for data flow
          const gradient = ctx.createLinearGradient(
            start.screenX, start.screenY,
            end.screenX, end.screenY
          );
          gradient.addColorStop(0, COLORS.data.pipeline);
          gradient.addColorStop(1, 
            target.type === 'ai' ? COLORS.data.aiNode :
            target.type === 'analytics' ? COLORS.data.analytics :
            COLORS.data.pipeline
          );

          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.moveTo(start.screenX, start.screenY);
          ctx.lineTo(end.screenX, end.screenY);
          
          // Animated flow
          const flowOffset = (Date.now() % 1000) / 1000;
          ctx.setLineDash([20, 20]);
          ctx.lineDashOffset = flowOffset * -50;
          ctx.stroke();
        });
      });

      // Draw nodes
      nodes.forEach(node => {
        const {screenX, screenY} = isoProject(node.x, node.y, node.z);
        const nodeSize = node.type === 'ai' ? 30 : 20;
        
        // Node glow
        ctx.shadowColor = 
          node.type === 'ai' ? COLORS.data.aiNode :
          node.type === 'analytics' ? COLORS.data.analytics :
          node.type === 'quality' ? COLORS.data.quality :
          COLORS.data.pipeline;
        ctx.shadowBlur = 20;
        
        // Draw node shape
        ctx.beginPath();
        if (node.type === 'ai') {
          // Hexagonal AI nodes
          for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            const x = screenX + Math.cos(angle) * nodeSize;
            const y = screenY + Math.sin(angle) * nodeSize;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
        } else {
          ctx.arc(screenX, screenY, nodeSize, 0, Math.PI * 2);
        }
        
        ctx.fillStyle = 
          node.type === 'ai' ? COLORS.data.aiNode :
          node.type === 'analytics' ? COLORS.data.analytics :
          node.type === 'quality' ? COLORS.data.quality :
          COLORS.data.pipeline;
        ctx.fill();

        // Quality indicators
        if (node.type === 'quality') {
          const quality = node.quality;
          const qualityColor = quality > CONFIG.qualityThreshold ? 
            COLORS.data.success : COLORS.data.error;
          
          ctx.beginPath();
          ctx.arc(screenX, screenY, nodeSize * 1.2, 0, Math.PI * 2 * quality);
          ctx.strokeStyle = qualityColor;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Analytics visualization
        if (node.type === 'analytics') {
          const time = Date.now() * 0.001;
          const value = Math.sin(time) * 0.5 + 0.5;
          
          ctx.beginPath();
          ctx.moveTo(screenX - nodeSize, screenY);
          for (let i = 0; i < nodeSize * 2; i++) {
            const x = screenX - nodeSize + i;
            const y = screenY + Math.sin(i * 0.2 + time) * 10 * value;
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle = COLORS.data.analytics;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    };

    const updateAndDrawDrop = (drop: MatrixDrop, timestamp: number) => {
      if (phaseRef.current === 'matrix') {
        // Normal Matrix rain behavior
        drop.y += drop.speed;
        drop.head = Math.floor(drop.y / CONFIG.fontSize) % drop.chars.length;
        
        for (let i = 0; i < drop.length; i++) {
          const charY = drop.y - (i * CONFIG.fontSize);
          if (charY < -CONFIG.fontSize || charY > canvas.height + CONFIG.fontSize) continue;
          
          const charIndex = (drop.head - i + drop.chars.length) % drop.chars.length;
          const char = drop.chars[charIndex];
          
          if (i === 0) {
            drawCharacter(char, drop.x, charY, COLORS.matrix.head, 1, 
              CONFIG.maxGlowStrength, 3, 1.15);
          } else if (i <= CONFIG.brightCharCount) {
            const brightness = 1 - (i / CONFIG.brightCharCount);
            drawCharacter(char, drop.x, charY, COLORS.matrix.bright, 
              brightness, CONFIG.glowStrength * brightness * 2, 2);
          } else {
            const fade = Math.pow(CONFIG.trailPower, i);
            drawCharacter(char, drop.x, charY, COLORS.matrix.dark, 
              fade, CONFIG.glowStrength * fade);
          }
        }
      } else if (phaseRef.current === 'transition' || phaseRef.current === 'data') {
        // Transition to data visualization
        if (!drop.targetX && !drop.isTransitioning) {
          const targetNode = nodesRef.current[Math.floor(Math.random() * nodesRef.current.length)];
          const target = isoProject(targetNode.x, targetNode.y, targetNode.z);
          drop.targetX = target.screenX;
          drop.targetY = target.screenY;
          drop.targetZ = targetNode.z;
          drop.type = targetNode.type;
          drop.isTransitioning = true;
        }

        if (drop.isTransitioning && drop.targetX !== undefined && drop.targetY !== undefined) {
          drop.morphProgress = Math.min(1, drop.morphProgress + 0.02);
          const progress = easeInOutCubic(drop.morphProgress);
          
          const x = drop.x + (drop.targetX - drop.x) * progress;
          const y = drop.y + (drop.targetY - drop.y) * progress;
          
          // Draw transitioning character
          const char = drop.chars[0];
          const color = drop.type === 'ai' ? COLORS.data.aiNode :
                       drop.type === 'analytics' ? COLORS.data.analytics :
                       drop.type === 'quality' ? COLORS.data.quality :
                       COLORS.data.pipeline;
          
          drawCharacter(
            char, x, y, 
            progress < 0.5 ? COLORS.matrix.bright : color,
            1, CONFIG.glowStrength * (1 + progress),
            1 + progress,
            1,
            progress * Math.PI * 2
          );
        }
      }

      // Reset or update characters
      if (Math.random() < CONFIG.charChangeFreq) {
        const chars = phaseRef.current === 'matrix' ? MATRIX_CHARS : DATA_CHARS;
        drop.chars[Math.floor(Math.random() * drop.chars.length)] = 
          chars[Math.floor(Math.random() * chars.length)];
      }

      // Reset drop if needed
      if (drop.y - (drop.length * CONFIG.fontSize) > canvas.height) {
        Object.assign(drop, createDrop(drop.x));
      }
    };

    const draw = (timestamp: number) => {
      // Phase management
      const elapsed = timestamp - timeRef.current;
      if (elapsed > CONFIG.transitionDuration) {
        timeRef.current = timestamp;
        phaseRef.current = 
          phaseRef.current === 'matrix' ? 'transition' :
          phaseRef.current === 'transition' ? 'data' : 'matrix';
        
        if (phaseRef.current === 'matrix') {
          dropsRef.current.forEach(drop => {
            drop.isTransitioning = false;
            drop.morphProgress = 0;
            drop.targetX = undefined;
            drop.targetY = undefined;
          });
        }
      }

      // Clear with fade effect
      ctx.fillStyle = `rgba(0, 0, 0, ${phaseRef.current === 'matrix' ? 0.18 : 0.3})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw data structures in later phases
      if (phaseRef.current === 'data') {
        drawDataStructures();
      }

      // Update and draw all drops
      dropsRef.current.forEach(drop => updateAndDrawDrop(drop, timestamp));
    };

    // Animation loop
    const animate = (timestamp: number) => {
      draw(timestamp);
      frameRef.current = requestAnimationFrame(animate);
    };

    // Initialize and start
    initCanvas();
    animate(0);

    // Handle resize
    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: COLORS.black,
      }}
    />
  );
};

export default MiamiMatrixRain; 