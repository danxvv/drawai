'use client';

import React, { useState } from 'react';
import { Type, Wand2 } from 'lucide-react';
import { useAIGeneration } from '../../hooks/useAIGeneration';

/**
 * Prompt Input component for AI image generation
 */
export default function PromptInput() {
  const { currentPrompt, setPrompt, isGenerating, clearError } = useAIGeneration();
  const [localPrompt, setLocalPrompt] = useState(currentPrompt || '');

  const handlePromptChange = (e) => {
    const newPrompt = e.target.value;
    setLocalPrompt(newPrompt);
    setPrompt(newPrompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      // Trigger generation via the parent component
      const generateButton = document.getElementById('ai-generate-button');
      if (generateButton) {
        generateButton.click();
      }
    }
  };

  const handleFocus = () => {
    // Clear any existing errors when user starts typing
    clearError();
  };

  // Prompt suggestions
  const promptSuggestions = [
    "Transform this sketch into a vibrant digital artwork",
    "Add realistic textures and lighting to my drawing",
    "Convert this to a watercolor painting style",
    "Make this look like a professional illustration",
    "Add magical elements and fantasy details",
    "Transform into a modern minimalist design",
    "Convert to a vintage poster style",
    "Add depth and 3D effects to my sketch"
  ];

  const handleSuggestionClick = (suggestion) => {
    setLocalPrompt(suggestion);
    setPrompt(suggestion);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Type className="w-4 h-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">
          Describe what you want to create
        </label>
      </div>

      <div className="relative">
        <textarea
          value={localPrompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Describe how you want to transform your canvas drawing... (Ctrl+Enter to generate)"
          className={`
            w-full p-3 border border-gray-300 rounded-lg text-sm resize-none
            focus:ring-2 focus:ring-purple-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500
            transition-all duration-200
            ${isGenerating ? 'opacity-50' : ''}
          `}
          rows={4}
          disabled={isGenerating}
          maxLength={500}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {localPrompt.length}/500
        </div>
      </div>

      {/* Prompt Suggestions */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1">
          <Wand2 className="w-3 h-3 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Quick Ideas:</span>
        </div>
        
        <div className="grid grid-cols-1 gap-1">
          {promptSuggestions.slice(0, 4).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isGenerating}
              className="
                text-left text-xs p-2 rounded-md border border-gray-200
                hover:border-purple-300 hover:bg-purple-50
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
                truncate
              "
              title={suggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Show More/Less Toggle */}
        <details className="group">
          <summary className="
            text-xs text-purple-600 hover:text-purple-800 cursor-pointer
            list-none flex items-center space-x-1
          ">
            <span>More suggestions</span>
            <svg 
              className="w-3 h-3 transition-transform group-open:rotate-180" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          
          <div className="mt-2 grid grid-cols-1 gap-1">
            {promptSuggestions.slice(4).map((suggestion, index) => (
              <button
                key={index + 4}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isGenerating}
                className="
                  text-left text-xs p-2 rounded-md border border-gray-200
                  hover:border-purple-300 hover:bg-purple-50
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-150
                  truncate
                "
                title={suggestion}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </details>
      </div>

      {/* Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>Tip:</strong> Be specific about style, colors, and mood</p>
        <p>⌨️ <strong>Shortcut:</strong> Ctrl+Enter to generate</p>
      </div>
    </div>
  );
}