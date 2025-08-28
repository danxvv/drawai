# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a paint-like web application built with Next.js 15.5.2 and React 19.1.0, using Fabric.js 6.7.1 for canvas operations. The application provides drawing tools, shape creation, image manipulation, and export functionality.

## Common Commands

- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build for production with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Architecture Overview

### State Management
The application uses React Context (`CanvasContext.js`) with useReducer for global state management. All canvas state, tool selection, colors, brush settings, and history are managed centrally.

Key state structure:
- `activeTool` - Current selected tool (select, pencil, hand_draw, rectangle, circle, triangle, line, image)
- `canvas` - Fabric.js canvas instance
- `history/historyStep` - Undo/redo functionality
- `strokeColor/fillColor/brushSize` - Drawing properties

### Component Structure
- `app/page.js` - Main application wrapper with CanvasProvider
- `context/CanvasContext.js` - Global state management and actions
- `components/Canvas/FabricCanvas.js` - Core Fabric.js canvas implementation
- `components/Toolbar/Toolbar.js` - Top toolbar (undo/redo/clear/export)
- `components/Sidebar/ToolPanel.js` - Left sidebar with tool selection
- `components/Controls/` - Reusable UI controls (ColorPicker, BrushSize, ExportButton)

### Fabric.js Integration
- Canvas initialization and event handling in `FabricCanvas.js`
- Tool switching logic updates canvas modes (`isDrawingMode`, `selection`)
- Different brush types: PencilBrush for hand_draw, standard brush for pencil
- Shape creation uses mouse events with real-time preview
- Image upload via `FabricImage.fromURL()` with drag-and-drop support

### Critical Fabric.js v6+ Considerations
- Import as `import * as fabric from 'fabric'` or specific classes like `import { FabricImage } from 'fabric'`
- `FabricImage.fromURL()` returns a Promise, not callback-based
- Enable drawing mode before accessing `freeDrawingBrush` properties
- Use `new fabric.PencilBrush()` for custom brush configuration

### Tool System
Tools are defined in `TOOLS` enum in CanvasContext:
- Drawing tools (pencil, hand_draw) enable `isDrawingMode`
- Shape tools (rectangle, circle, triangle, line) use custom mouse event handlers
- Select tool enables object manipulation
- Image tool triggers file upload

### Export Functionality
Canvas export supports multiple formats through `canvas.toDataURL()` with options for PNG, JPEG, and base64 output. Export component provides download and clipboard copy functionality.