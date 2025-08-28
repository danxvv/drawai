# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a paint-like web application built with Next.js 15.5.2 and React 19.1.0, using Fabric.js 6.7.1 for canvas operations. The application provides drawing tools, shape creation, image manipulation, export functionality, and AI-powered image generation through OpenRouter API integration.

## Common Commands

- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build for production with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Architecture Overview

This is a React-based drawing application with a three-panel layout: left tool sidebar, center canvas area, and right AI panel. The architecture emphasizes centralized state management through React Context and proper separation of concerns between UI components, canvas operations, and AI services.

### State Management
The application uses React Context (`CanvasContext.js`) with useReducer for global state management. All canvas state, tool selection, colors, brush settings, and history are managed centrally.

Key state structure:
- `activeTool` - Current selected tool (select, pencil, hand_draw, rectangle, circle, triangle, line, image)
- `canvas` - Fabric.js canvas instance
- `history/historyStep` - Undo/redo functionality
- `strokeColor/fillColor/brushSize` - Drawing properties
- `ai` - AI generation state (isGenerating, generatedImages, currentPrompt, error, apiKey, etc.)

### Component Structure
- `app/page.js` - Main application wrapper with CanvasProvider (three-panel layout)
- `context/CanvasContext.js` - Global state management and actions
- `components/Canvas/FabricCanvas.js` - Core Fabric.js canvas implementation
- `components/Toolbar/Toolbar.js` - Top toolbar (undo/redo/clear/export)
- `components/Sidebar/ToolPanel.js` - Left sidebar with tool selection
- `components/AISection/AIPanel.js` - Right sidebar with AI generation interface
- `components/Controls/` - Reusable UI controls (ColorPicker, BrushSize, ExportButton)
- `hooks/useAIGeneration.js` - Custom hook for AI functionality
- `services/aiService.js` - OpenRouter API integration service

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

### AI Image Generation
Integrated with OpenRouter API using Google Gemini Flash Image Preview model:
- Right-side AI panel for prompt input and generated image display
- Canvas context sent with prompts for contextual generation
- Generated images can be downloaded, copied to clipboard, or added to canvas
- API key stored securely in localStorage
- Streaming response handling for real-time generation feedback

### Keyboard Shortcuts
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` - Redo
- `Delete/Backspace` - Delete selected objects

### Development Patterns
- Use `useCanvas()` hook to access global canvas state and actions
- Canvas operations trigger `actions.saveState()` for undo/redo functionality
- Fabric.js v6+ requires Promise-based image loading: `await FabricImage.fromURL()`
- Always check canvas instance exists before operations
- AI features require valid OpenRouter API key for functionality