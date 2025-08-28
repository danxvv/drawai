'use client';

import React from 'react';
import { useCanvas } from '../../context/CanvasContext';

const brushSizes = [
  { size: 1, label: 'XS' },
  { size: 3, label: 'S' },
  { size: 5, label: 'M' },
  { size: 10, label: 'L' },
  { size: 15, label: 'XL' },
  { size: 25, label: '2XL' }
];

export default function BrushSize() {
  const { state, actions } = useCanvas();

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Brush Size</h3>
      
      {/* Size Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600">Size</span>
          <span className="text-xs font-medium text-gray-900">{state.brushSize}px</span>
        </div>
        
        <input
          type="range"
          min="1"
          max="50"
          value={state.brushSize}
          onChange={(e) => actions.setBrushSize(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(state.brushSize - 1) / 49 * 100}%, #e5e7eb ${(state.brushSize - 1) / 49 * 100}%, #e5e7eb 100%)`
          }}
        />
        
        {/* Visual preview */}
        <div className="flex justify-center mt-3">
          <div
            className="rounded-full bg-gray-800"
            style={{
              width: `${Math.min(state.brushSize, 30)}px`,
              height: `${Math.min(state.brushSize, 30)}px`
            }}
          />
        </div>
      </div>

      {/* Preset Size Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {brushSizes.map((brush) => (
          <button
            key={brush.size}
            onClick={() => actions.setBrushSize(brush.size)}
            className={`
              flex flex-col items-center justify-center p-2 rounded-lg border transition-all
              ${state.brushSize === brush.size
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }
            `}
            title={`${brush.size}px`}
          >
            <div
              className="rounded-full bg-current mb-1"
              style={{
                width: `${Math.min(brush.size + 2, 12)}px`,
                height: `${Math.min(brush.size + 2, 12)}px`
              }}
            />
            <span className="text-xs font-medium">{brush.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Size Input */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Custom Size
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max="100"
            value={state.brushSize}
            onChange={(e) => {
              const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
              actions.setBrushSize(value);
            }}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />
          <span className="text-xs text-gray-500">px</span>
        </div>
      </div>
    </div>
  );
}