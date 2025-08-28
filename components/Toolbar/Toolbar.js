'use client';

import React from 'react';
import { Undo2, Redo2, Trash2, PanelLeft, Sparkles } from 'lucide-react';
import { useCanvas } from '../../context/CanvasContext';
import ExportButton from '../Controls/ExportButton';

export default function Toolbar() {
  const { state, actions } = useCanvas();

  const canUndo = state.historyStep > 0;
  const canRedo = state.historyStep < state.history.length - 1;

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-2 shadow-sm z-40 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">CoDrawing</h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mobile Panel Toggles */}
          <div className="flex items-center md:hidden space-x-1">
            <button
              onClick={actions.toggleToolPanel}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              title="Toggle Tools Panel"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
            <button
              onClick={actions.toggleAIPanelMobile}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              title="Toggle AI Panel"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>

          {/* Divider for mobile */}
          <div className="w-px h-6 bg-gray-200 md:hidden" />

          {/* Undo/Redo */}
          <div className="flex items-center space-x-1">
            <button
              onClick={actions.undo}
              disabled={!canUndo}
              className={`p-2 rounded-md transition-colors ${
                canUndo 
                  ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={actions.redo}
              disabled={!canRedo}
              className={`p-2 rounded-md transition-colors ${
                canRedo 
                  ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Clear Canvas */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
                actions.clearCanvas();
              }
            }}
            className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Clear</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Export */}
          <ExportButton />
        </div>
      </div>
    </div>
  );
}