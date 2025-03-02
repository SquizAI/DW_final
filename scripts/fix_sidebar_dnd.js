/**
 * fix_sidebar_dnd.js
 * 
 * This script provides a solution for sidebar drag-and-drop functionality issues.
 * It implements a custom drag-and-drop system for the workflow sidebar.
 */

import React from 'react';

// Custom hook for drag-and-drop functionality
export function useDragAndDrop({ onDragStart, onDragEnd }) {
  // Track the dragged item
  const [draggedItem, setDraggedItem] = React.useState(null);
  
  // Handle drag start
  const handleDragStart = (event, item) => {
    // Create a ghost image for the dragged item
    const ghostElement = document.createElement('div');
    ghostElement.classList.add('dnd-ghost-element');
    ghostElement.innerHTML = `<div class="node-preview">${item.label || item.type}</div>`;
    document.body.appendChild(ghostElement);
    
    // Set the ghost image for the drag operation
    event.dataTransfer.setDragImage(ghostElement, 20, 20);
    
    // Set the data transfer
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
    
    // Update state
    setDraggedItem(item);
    
    // Call the onDragStart callback
    if (onDragStart) {
      onDragStart(event, item);
    }
    
    // Remove the ghost element after a short delay
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };
  
  // Handle drag end
  const handleDragEnd = (event) => {
    // Reset state
    setDraggedItem(null);
    
    // Call the onDragEnd callback
    if (onDragEnd) {
      onDragEnd(event, draggedItem);
    }
  };
  
  return {
    draggedItem,
    handleDragStart,
    handleDragEnd,
  };
}

// Draggable item component
export function DraggableItem({ item, onDragStart, onDragEnd, children }) {
  const { handleDragStart, handleDragEnd } = useDragAndDrop({
    onDragStart,
    onDragEnd,
  });
  
  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, item)}
      onDragEnd={handleDragEnd}
      className="draggable-item"
    >
      {children}
    </div>
  );
}

// Drop target component
export function DropTarget({ onDrop, children, className }) {
  const [isOver, setIsOver] = React.useState(false);
  
  // Handle drag over
  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  };
  
  // Handle drag leave
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  // Handle drop
  const handleDrop = (event) => {
    event.preventDefault();
    setIsOver(false);
    
    try {
      const data = event.dataTransfer.getData('application/reactflow');
      const item = JSON.parse(data);
      
      // Get drop position relative to the canvas
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      
      // Call the onDrop callback
      if (onDrop) {
        onDrop(item, position, event);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };
  
  return (
    <div
      className={`drop-target ${className || ''} ${isOver ? 'drop-target--over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
}

// Usage example:
/*
import { DraggableItem, DropTarget } from '../scripts/fix_sidebar_dnd';

// In your sidebar component
const Sidebar = () => {
  const nodeTypes = [
    { type: 'datasetLoader', label: 'Dataset Loader' },
    { type: 'structuralAnalysis', label: 'Structural Analysis' },
    // ...more node types
  ];
  
  return (
    <div className="sidebar">
      <h3>Node Types</h3>
      <div className="node-list">
        {nodeTypes.map((nodeType) => (
          <DraggableItem
            key={nodeType.type}
            item={nodeType}
            onDragStart={(event, item) => {
              console.log('Drag started:', item);
            }}
          >
            <div className="node-item">
              <span className="node-icon">{nodeType.icon}</span>
              <span className="node-label">{nodeType.label}</span>
            </div>
          </DraggableItem>
        ))}
      </div>
    </div>
  );
};

// In your canvas component
const Canvas = () => {
  const handleDrop = (item, position, event) => {
    // Create a new node at the drop position
    const newNode = {
      id: `${item.type}-${Date.now()}`,
      type: item.type,
      position,
      data: { label: item.label },
    };
    
    // Add the node to your nodes state
    setNodes((nds) => [...nds, newNode]);
  };
  
  return (
    <DropTarget onDrop={handleDrop} className="canvas-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </DropTarget>
  );
};
*/

// CSS for drag-and-drop
/*
.draggable-item {
  cursor: grab;
  user-select: none;
}

.draggable-item:active {
  cursor: grabbing;
}

.drop-target {
  position: relative;
}

.drop-target--over {
  outline: 2px dashed #2196f3;
  outline-offset: -2px;
}

.dnd-ghost-element {
  position: absolute;
  top: -1000px;
  left: -1000px;
  z-index: -1;
}

.node-preview {
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  white-space: nowrap;
}
*/ 