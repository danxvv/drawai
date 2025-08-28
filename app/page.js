'use client';

import React from 'react';
import { CanvasProvider, useCanvas } from '../context/CanvasContext';
import Toolbar from '../components/Toolbar/Toolbar';
import ToolPanel from '../components/Sidebar/ToolPanel';
import FabricCanvas from '../components/Canvas/FabricCanvas';
import AIPanel from '../components/AISection/AIPanel';

const AppContent = () => {
  const { state, actions } = useCanvas();
  const { isToolPanelOpen, isAIPanelOpen } = state;

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools Panel */}
        <ToolPanel />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <FabricCanvas />
        </main>
        
        {/* Right Sidebar - AI Panel */}
        <AIPanel />
      </div>

      {/* Backdrop for mobile panels */}
      {(isToolPanelOpen || isAIPanelOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={actions.closePanels}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default function PaintApp() {
  return (
    <CanvasProvider>
      <AppContent />
    </CanvasProvider>
  );
}