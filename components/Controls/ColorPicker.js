'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

const presetColors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#800000', '#008000', '#000080', '#808000',
  '#800080', '#008080', '#c0c0c0', '#808080', '#ffc0cb', '#ffa500',
  '#a52a2a', '#dda0dd', '#98fb98', '#f0e68c', '#87ceeb', '#ff6347'
];

export default function ColorPicker({ color, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 rounded-md border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        style={{ backgroundColor: color }}
        title={`Current color: ${color}`}
      >
        <span className="sr-only">Pick color</span>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200"
          style={{ minWidth: '240px' }}
        >
          {/* Hex Color Picker */}
          <div className="mb-4">
            <HexColorPicker color={color} onChange={onChange} />
          </div>

          {/* Current Color Display */}
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                value={color.toUpperCase()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    onChange(value);
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">Preset Colors</h4>
            <div className="grid grid-cols-8 gap-1">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => onChange(presetColor)}
                  className={`
                    w-6 h-6 rounded border-2 transition-all hover:scale-110
                    ${color.toLowerCase() === presetColor.toLowerCase() 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => onChange('#ffffff')}
              className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              White
            </button>
            <button
              onClick={() => onChange('#000000')}
              className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              Black
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}