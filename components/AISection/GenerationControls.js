'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, Key, Trash2 } from 'lucide-react';
import { useAIGeneration } from '../../hooks/useAIGeneration';

/**
 * Generation Controls component - Generate button and related controls
 */
export default function GenerationControls() {
  const {
    generateImage,
    isGenerating,
    currentPrompt,
    hasCanvas,
    apiKey,
    showApiKeyModal,
    retryGeneration,
    clearGeneratedImages,
    generatedImages,
    error
  } = useAIGeneration();

  const [progress, setProgress] = useState('');

  const handleGenerate = async () => {
    if (!currentPrompt.trim()) {
      return;
    }

    try {
      setProgress('Preparing...');
      await generateImage(currentPrompt, (progressData) => {
        if (progressData.type === 'progress' && progressData.content) {
          setProgress('Generating...');
        }
      });
      setProgress('');
    } catch (error) {
      setProgress('');
      console.error('Generation failed:', error);
    }
  };

  const canGenerate = !isGenerating && currentPrompt.trim() && hasCanvas && apiKey;

  return (
    <div className="space-y-3">
      {/* Main Generate Button */}
      <button
        id="ai-generate-button"
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={`
          w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200
          flex items-center justify-center space-x-2
          ${canGenerate
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
          ${isGenerating ? 'animate-pulse' : ''}
        `}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generate Image</span>
          </>
        )}
      </button>

      {/* Progress Text */}
      {isGenerating && progress && (
        <div className="text-center">
          <p className="text-xs text-gray-600">{progress}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {!hasCanvas && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          Canvas not ready. Please wait for the canvas to load.
        </div>
      )}

      {!apiKey && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          API key required. 
          <button
            onClick={() => showApiKeyModal(true)}
            className="ml-1 underline hover:no-underline"
          >
            Set API key
          </button>
        </div>
      )}

      {!currentPrompt.trim() && hasCanvas && apiKey && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          Enter a prompt above to generate an image.
        </div>
      )}

      {/* Secondary Controls */}
      <div className="flex space-x-2">
        {/* Retry Button */}
        {error && (
          <button
            onClick={retryGeneration}
            disabled={isGenerating || !canGenerate}
            className="
              flex-1 py-2 px-3 text-xs font-medium rounded-md
              bg-gray-100 text-gray-700 hover:bg-gray-200
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-150
              flex items-center justify-center space-x-1
            "
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        )}

        {/* API Key Button */}
        <button
          onClick={() => showApiKeyModal(true)}
          className="
            flex-1 py-2 px-3 text-xs font-medium rounded-md
            bg-gray-100 text-gray-700 hover:bg-gray-200
            transition-colors duration-150
            flex items-center justify-center space-x-1
          "
        >
          <Key className="w-3 h-3" />
          <span>{apiKey ? 'Change Key' : 'Set API Key'}</span>
        </button>

        {/* Clear Images Button */}
        {generatedImages.length > 0 && (
          <button
            onClick={clearGeneratedImages}
            className="
              flex-1 py-2 px-3 text-xs font-medium rounded-md
              bg-red-100 text-red-700 hover:bg-red-200
              transition-colors duration-150
              flex items-center justify-center space-x-1
            "
            title="Clear all generated images"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Generation Stats */}
      {generatedImages.length > 0 && (
        <div className="text-xs text-gray-500 text-center">
          {generatedImages.length} image{generatedImages.length !== 1 ? 's' : ''} generated
        </div>
      )}

      {/* Tips */}
      <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-2 rounded">
        <p><strong>💡 Pro Tips:</strong></p>
        <ul className="space-y-1 ml-2">
          <li>• Draw something on the canvas first</li>
          <li>• Be specific in your prompt</li>
          <li>• Mention art styles, colors, mood</li>
          <li>• Try different prompts for variety</li>
        </ul>
      </div>
    </div>
  );
}