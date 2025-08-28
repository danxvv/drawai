# CoDrawing

A modern, feature-rich digital drawing and painting application built with Next.js, React, and Fabric.js. Create digital art with powerful drawing tools and AI-powered image generation.

## 🎨 Features

### Drawing Tools
- **Pencil Tool** - Standard drawing with customizable brush size and color
- **Hand Draw Tool** - Smooth, pressure-sensitive drawing with PencilBrush
- **Shape Tools** - Rectangle, Circle, Triangle, and Line with real-time preview
- **Selection Tool** - Move, resize, and manipulate objects on the canvas
- **Image Upload** - Drag and drop images directly onto the canvas

### AI-Powered Generation
- **Context-Aware AI** - Generate images based on your current canvas content
- **OpenRouter Integration** - Powered by Google Gemini Flash Image Preview model
- **Smart Prompting** - AI analyzes existing artwork for better integration
- **Multiple Export Options** - Download, copy to clipboard, or add directly to canvas

### Canvas Management
- **Unlimited Undo/Redo** - Full history management with keyboard shortcuts
- **Export Functionality** - Save your artwork as PNG with high quality
- **Responsive Canvas** - Automatically adapts to window size
- **Drag & Drop Support** - Easy image import

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd codrawing
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### AI Features Setup

To use AI image generation features:

1. Get an API key from [OpenRouter](https://openrouter.ai)
2. Click the key icon in the AI panel
3. Enter your API key (stored securely in your browser)

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` - Redo  
- `Delete/Backspace` - Delete selected objects

## 🏗️ Built With

- **[Next.js 15.5.2](https://nextjs.org)** - React framework with Turbopack
- **[React 19.1.0](https://react.dev)** - UI library
- **[Fabric.js 6.7.1](http://fabricjs.com)** - Canvas manipulation library
- **[Tailwind CSS 4](https://tailwindcss.com)** - Styling framework
- **[Lucide React](https://lucide.dev)** - Icon library
- **[OpenRouter API](https://openrouter.ai)** - AI image generation

## 🏛️ Architecture

### Three-Panel Layout
- **Left Sidebar** - Drawing tools and controls
- **Center Canvas** - Main drawing area with Fabric.js integration  
- **Right AI Panel** - AI generation interface (collapsible)

### State Management
- React Context with useReducer for global state
- Centralized canvas operations and history management
- Persistent AI settings and generated image storage

### Key Components
- `CanvasContext` - Global state management
- `FabricCanvas` - Core canvas implementation
- `AIService` - OpenRouter API integration
- `useAIGeneration` - AI functionality hook

## 📝 Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production  
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
