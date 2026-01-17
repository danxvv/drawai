'use client';

import React, { useState } from 'react';
import {
  MousePointer2,
  PenTool,
  Hand,
  Square,
  Circle,
  Triangle,
  Minus,
  Image,
  Upload,
  AlertCircle
} from 'lucide-react';
import { FabricImage } from 'fabric';
import { useCanvas } from '../../context/CanvasContext';
import { validateImageFile } from '../../utils/imageValidation';
import ColorPicker from '../Controls/ColorPicker';
import BrushSize from '../Controls/BrushSize';

const tools = [
  { id: 'select', name: 'Select', icon: MousePointer2, shortcut: 'V' },
  { id: 'pencil', name: 'Pencil', icon: PenTool, shortcut: 'P' },
  { id: 'hand_draw', name: 'Hand Draw', icon: Hand, shortcut: 'H' },
  { id: 'rectangle', name: 'Rectangle', icon: Square, shortcut: 'R' },
  { id: 'circle', name: 'Circle', icon: Circle, shortcut: 'C' },
  { id: 'triangle', name: 'Triangle', icon: Triangle, shortcut: 'T' },
  { id: 'line', name: 'Line', icon: Minus, shortcut: 'L' },
  { id: 'image', name: 'Image', icon: Image, shortcut: 'I' }
];

export default function ToolPanel() {
  const { state, actions, TOOLS } = useCanvas();
  const [uploadError, setUploadError] = useState(null);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    setUploadError(null);

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Validate image before loading
        const validation = await validateImageFile(file);
        if (!validation.valid) {
          setUploadError(validation.error);
          // Auto-clear error after 5 seconds
          setTimeout(() => setUploadError(null), 5000);
          continue;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          if (state.canvas) {
            try {
              const img = await FabricImage.fromURL(e.target.result, {
                crossOrigin: 'anonymous'
              });

              // Scale image to fit canvas
              const maxWidth = state.canvas.width * 0.5;
              const maxHeight = state.canvas.height * 0.5;

              if (img.width > maxWidth || img.height > maxHeight) {
                const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
                img.scale(scale);
              }

              // Center image
              img.set({
                left: (state.canvas.width - img.getScaledWidth()) / 2,
                top: (state.canvas.height - img.getScaledHeight()) / 2
              });

              state.canvas.add(img);
              state.canvas.renderAll();
              actions.saveState();
            } catch (error) {
              console.error('Error loading image:', error);
              setUploadError('Failed to load image. Please try again.');
              setTimeout(() => setUploadError(null), 5000);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }

    // Reset input
    event.target.value = '';
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const toolMap = {
        'v': TOOLS.SELECT,
        'p': TOOLS.PENCIL,
        'r': TOOLS.RECTANGLE,
        'c': TOOLS.CIRCLE,
        't': TOOLS.TRIANGLE,
        'l': TOOLS.LINE,
        'i': TOOLS.IMAGE
      };

      const tool = toolMap[e.key.toLowerCase()];
      if (tool) {
        e.preventDefault();
        actions.setActiveTool(tool);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col space-y-6">
      {/* Tools Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = state.activeTool === tool.id;
            const isImageTool = tool.id === 'image';
            
            if (isImageTool) {
              return (
                <label
                  key={tool.id}
                  className={`
                    relative flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${isActive 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                  title={`${tool.name} (${tool.shortcut})`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{tool.name}</span>
                </label>
              );
            }
            
            return (
              <button
                key={tool.id}
                onClick={() => actions.setActiveTool(tool.id)}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                  ${isActive 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                  }
                `}
                title={`${tool.name} (${tool.shortcut})`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brush Size */}
      <BrushSize />

      {/* Colors */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Colors</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Stroke Color
            </label>
            <ColorPicker
              color={state.strokeColor}
              onChange={actions.setStrokeColor}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Fill Color
            </label>
            <ColorPicker
              color={state.fillColor}
              onChange={actions.setFillColor}
            />
          </div>
        </div>
      </div>

      {/* Upload Error Display */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-red-800">{uploadError}</p>
              <button
                onClick={() => setUploadError(null)}
                className="text-xs text-red-600 hover:text-red-800 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-xs font-medium text-gray-900 mb-2">Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Drag images onto canvas</li>
          <li>• Use keyboard shortcuts</li>
          <li>• Delete selected objects</li>
          <li>• Ctrl+Z to undo</li>
        </ul>
      </div>
    </div>
  );
}