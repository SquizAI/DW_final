/**
 * fix_reactflow_sizing.js
 * 
 * This script provides a solution for ReactFlow container sizing issues.
 * Add this to your workflow component to ensure proper sizing of the ReactFlow container.
 */

// Import this function in your workflow component
export function useReactFlowContainerSize(containerRef) {
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Function to update dimensions
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial update
    updateDimensions();

    // Create ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    // Clean up
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return dimensions;
}

// Usage example:
/*
import { useReactFlowContainerSize } from '../scripts/fix_reactflow_sizing';

const WorkflowCanvas = () => {
  const containerRef = React.useRef(null);
  const { width, height } = useReactFlowContainerSize(containerRef);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        flex: 1
      }}
    >
      <ReactFlow
        style={{ width, height }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};
*/

// CSS fixes for ReactFlow container
/*
.react-flow-container {
  width: 100%;
  height: 100%;
  position: relative;
  flex: 1;
  display: flex;
  overflow: hidden;
}

.react-flow {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.react-flow__renderer {
  width: 100%;
  height: 100%;
}
*/ 