'use client';

import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';

const TOOLS = {
  SELECT: 'select',
  PENCIL: 'pencil',
  HAND_DRAW: 'hand_draw',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
  LINE: 'line',
  IMAGE: 'image'
};

const initialState = {
  activeTool: TOOLS.SELECT,
  strokeColor: '#000000',
  fillColor: '#ffffff',
  brushSize: 5,
  canvas: null,
  history: [],
  historyStep: -1,
  isDrawing: false
};

function canvasReducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_TOOL':
      return { ...state, activeTool: action.payload };
    case 'SET_STROKE_COLOR':
      return { ...state, strokeColor: action.payload };
    case 'SET_FILL_COLOR':
      return { ...state, fillColor: action.payload };
    case 'SET_BRUSH_SIZE':
      return { ...state, brushSize: action.payload };
    case 'SET_CANVAS':
      return { ...state, canvas: action.payload };
    case 'SET_IS_DRAWING':
      return { ...state, isDrawing: action.payload };
    case 'SAVE_STATE':
      const newHistory = state.history.slice(0, state.historyStep + 1);
      newHistory.push(action.payload);
      return {
        ...state,
        history: newHistory,
        historyStep: newHistory.length - 1
      };
    case 'UNDO':
      if (state.historyStep > 0) {
        return { ...state, historyStep: state.historyStep - 1 };
      }
      return state;
    case 'REDO':
      if (state.historyStep < state.history.length - 1) {
        return { ...state, historyStep: state.historyStep + 1 };
      }
      return state;
    case 'CLEAR_HISTORY':
      return { ...state, history: [], historyStep: -1 };
    default:
      return state;
  }
}

const CanvasContext = createContext();

export function CanvasProvider({ children }) {
  const [state, dispatch] = useReducer(canvasReducer, initialState);
  const canvasRef = useRef(null);

  const actions = {
    setActiveTool: (tool) => dispatch({ type: 'SET_ACTIVE_TOOL', payload: tool }),
    setStrokeColor: (color) => dispatch({ type: 'SET_STROKE_COLOR', payload: color }),
    setFillColor: (color) => dispatch({ type: 'SET_FILL_COLOR', payload: color }),
    setBrushSize: (size) => dispatch({ type: 'SET_BRUSH_SIZE', payload: size }),
    setCanvas: (canvas) => dispatch({ type: 'SET_CANVAS', payload: canvas }),
    setIsDrawing: (drawing) => dispatch({ type: 'SET_IS_DRAWING', payload: drawing }),
    
    saveState: () => {
      if (state.canvas) {
        const canvasState = JSON.stringify(state.canvas.toJSON());
        dispatch({ type: 'SAVE_STATE', payload: canvasState });
      }
    },
    
    undo: () => {
      if (state.historyStep > 0) {
        dispatch({ type: 'UNDO' });
        const prevState = state.history[state.historyStep - 1];
        if (prevState && state.canvas) {
          state.canvas.loadFromJSON(prevState, () => {
            state.canvas.renderAll();
          });
        }
      }
    },
    
    redo: () => {
      if (state.historyStep < state.history.length - 1) {
        dispatch({ type: 'REDO' });
        const nextState = state.history[state.historyStep + 1];
        if (nextState && state.canvas) {
          state.canvas.loadFromJSON(nextState, () => {
            state.canvas.renderAll();
          });
        }
      }
    },
    
    clearCanvas: () => {
      if (state.canvas) {
        state.canvas.clear();
        state.canvas.backgroundColor = '#ffffff';
        state.canvas.renderAll();
        actions.saveState();
      }
    },
    
    exportCanvas: () => {
      if (state.canvas) {
        return state.canvas.toDataURL({
          format: 'png',
          quality: 1
        });
      }
      return null;
    },

    deleteSelected: () => {
      if (state.canvas) {
        const activeObjects = state.canvas.getActiveObjects();
        if (activeObjects.length) {
          activeObjects.forEach(obj => state.canvas.remove(obj));
          state.canvas.discardActiveObject();
          state.canvas.renderAll();
          actions.saveState();
        }
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          actions.undo();
        } else if (e.key === 'z' && e.shiftKey || e.key === 'y') {
          e.preventDefault();
          actions.redo();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        actions.deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.canvas, state.historyStep, state.history]);

  return (
    <CanvasContext.Provider value={{ state, actions, canvasRef, TOOLS }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}