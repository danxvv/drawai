'use client';

import React from 'react';
import { CanvasProvider } from '../context/CanvasContext';
import Toolbar from '../components/Toolbar/Toolbar';
import ToolPanel from '../components/Sidebar/ToolPanel';
import FabricCanvas from '../components/Canvas/FabricCanvas';

export default function PaintApp() {
  return (
    <CanvasProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Top Toolbar */}
        <Toolbar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Tools */}
          <ToolPanel />
          
          {/* Canvas Area */}
          <FabricCanvas />
        </div>
      </div>
    </CanvasProvider>
  );
}