'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useCanvas } from '../../context/CanvasContext';

export default function FabricCanvas() {
  const { state, actions, canvasRef, TOOLS } = useCanvas();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    // Initialize Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: '#ffffff',
      selection: state.activeTool === TOOLS.SELECT
    });

    // Configure canvas settings - enable drawing mode for drawing tools
    canvas.isDrawingMode = state.activeTool === TOOLS.PENCIL || state.activeTool === TOOLS.HAND_DRAW;
    
    // Now safely configure brush properties
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = state.brushSize;
      canvas.freeDrawingBrush.color = state.strokeColor;
      
      // Configure different brush types based on tool
      if (state.activeTool === TOOLS.HAND_DRAW) {
        // Use PencilBrush for smoother hand drawing
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = state.brushSize;
        canvas.freeDrawingBrush.color = state.strokeColor;
        canvas.freeDrawingBrush.strokeLineCap = 'round';
        canvas.freeDrawingBrush.strokeLineJoin = 'round';
      }
    }

    actions.setCanvas(canvas);

    // Save initial state
    setTimeout(() => {
      actions.saveState();
    }, 100);

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const newWidth = Math.min(container.clientWidth - 40, 1200);
        const newHeight = Math.min(container.clientHeight - 40, 800);
        
        setDimensions({ width: newWidth, height: newHeight });
        canvas.setDimensions({ width: newWidth, height: newHeight });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  // Update canvas settings when state changes
  useEffect(() => {
    if (!state.canvas) return;

    const canvas = state.canvas;

    // Update drawing mode
    canvas.isDrawingMode = state.activeTool === TOOLS.PENCIL || state.activeTool === TOOLS.HAND_DRAW;
    canvas.selection = state.activeTool === TOOLS.SELECT;

    // Configure different brush types based on tool
    if (state.activeTool === TOOLS.HAND_DRAW) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.strokeLineCap = 'round';
      canvas.freeDrawingBrush.strokeLineJoin = 'round';
    }

    // Update brush settings
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = state.brushSize;
      canvas.freeDrawingBrush.color = state.strokeColor;
    }

    // Update selection style
    fabric.Object.prototype.set({
      borderColor: '#2563eb',
      cornerColor: '#2563eb',
      cornerSize: 8,
      transparentCorners: false
    });

  }, [state.activeTool, state.brushSize, state.strokeColor, state.canvas]);

  // Handle mouse events for shape creation
  useEffect(() => {
    if (!state.canvas) return;

    const canvas = state.canvas;
    let isDrawing = false;
    let startX, startY;
    let activeShape = null;

    const handleMouseDown = (o) => {
      if ([TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.TRIANGLE, TOOLS.LINE].includes(state.activeTool)) {
        isDrawing = true;
        const pointer = canvas.getPointer(o.e);
        startX = pointer.x;
        startY = pointer.y;

        // Create shape based on active tool
        switch (state.activeTool) {
          case TOOLS.RECTANGLE:
            activeShape = new fabric.Rect({
              left: startX,
              top: startY,
              width: 0,
              height: 0,
              fill: state.fillColor,
              stroke: state.strokeColor,
              strokeWidth: state.brushSize
            });
            break;
          case TOOLS.CIRCLE:
            activeShape = new fabric.Circle({
              left: startX,
              top: startY,
              radius: 0,
              fill: state.fillColor,
              stroke: state.strokeColor,
              strokeWidth: state.brushSize
            });
            break;
          case TOOLS.TRIANGLE:
            activeShape = new fabric.Triangle({
              left: startX,
              top: startY,
              width: 0,
              height: 0,
              fill: state.fillColor,
              stroke: state.strokeColor,
              strokeWidth: state.brushSize
            });
            break;
          case TOOLS.LINE:
            activeShape = new fabric.Line([startX, startY, startX, startY], {
              stroke: state.strokeColor,
              strokeWidth: state.brushSize,
              selectable: true
            });
            break;
        }

        if (activeShape) {
          canvas.add(activeShape);
        }
      }
    };

    const handleMouseMove = (o) => {
      if (!isDrawing || !activeShape) return;

      const pointer = canvas.getPointer(o.e);
      const width = Math.abs(pointer.x - startX);
      const height = Math.abs(pointer.y - startY);

      switch (state.activeTool) {
        case TOOLS.RECTANGLE:
          activeShape.set({
            width: width,
            height: height,
            left: Math.min(startX, pointer.x),
            top: Math.min(startY, pointer.y)
          });
          break;
        case TOOLS.CIRCLE:
          const radius = Math.sqrt(width * width + height * height) / 2;
          activeShape.set({
            radius: radius,
            left: Math.min(startX, pointer.x),
            top: Math.min(startY, pointer.y)
          });
          break;
        case TOOLS.TRIANGLE:
          activeShape.set({
            width: width,
            height: height,
            left: Math.min(startX, pointer.x),
            top: Math.min(startY, pointer.y)
          });
          break;
        case TOOLS.LINE:
          activeShape.set({
            x2: pointer.x,
            y2: pointer.y
          });
          break;
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (isDrawing && activeShape) {
        isDrawing = false;
        activeShape = null;
        actions.saveState();
      }
    };

    // Handle path creation (free drawing)
    const handlePathCreated = () => {
      actions.saveState();
    };

    // Handle object modification
    const handleObjectModified = () => {
      actions.saveState();
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('path:created', handlePathCreated);
    canvas.on('object:modified', handleObjectModified);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('path:created', handlePathCreated);
      canvas.off('object:modified', handleObjectModified);
    };
  }, [state.canvas, state.activeTool, state.strokeColor, state.fillColor, state.brushSize]);

  // Handle image upload via drag and drop
  useEffect(() => {
    if (!state.canvas) return;

    const canvas = state.canvas;
    const canvasElement = canvas.getElement();

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            fabric.Image.fromURL(event.target.result, (img) => {
              // Scale image to fit canvas
              const maxWidth = canvas.width * 0.5;
              const maxHeight = canvas.height * 0.5;
              
              if (img.width > maxWidth || img.height > maxHeight) {
                const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
                img.scale(scale);
              }

              // Center image
              img.set({
                left: (canvas.width - img.getScaledWidth()) / 2,
                top: (canvas.height - img.getScaledHeight()) / 2
              });

              canvas.add(img);
              canvas.renderAll();
              actions.saveState();
            });
          };
          reader.readAsDataURL(file);
        }
      });
    };

    canvasElement.addEventListener('dragover', handleDragOver);
    canvasElement.addEventListener('drop', handleDrop);

    return () => {
      canvasElement.removeEventListener('dragover', handleDragOver);
      canvasElement.removeEventListener('drop', handleDrop);
    };
  }, [state.canvas]);

  return (
    <div 
      ref={containerRef} 
      className="flex-1 flex items-center justify-center bg-gray-50 p-5"
    >
      <div className="bg-white rounded-lg shadow-lg p-2">
        <canvas 
          ref={canvasRef}
          className="border border-gray-300 rounded"
        />
      </div>
    </div>
  );
}