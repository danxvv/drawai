'use client';

import React from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Key, AlertCircle } from 'lucide-react';
import { useAIGeneration } from '../../hooks/useAIGeneration';
import { useCanvas } from '../../context/CanvasContext';
import PromptInput from './PromptInput';
import GenerationControls from './GenerationControls';
import GeneratedImageDisplay from './GeneratedImageDisplay';
import ApiKeyModal from './ApiKeyModal';

export default function AIPanel() {
  const {
    isAIPanelCollapsed,
    toggleAIPanel,
    showApiKeyModal,
    error,
    clearError,
    apiKey,
    generatedImages
  } = useAIGeneration();

  const { state: uiState } = useCanvas();
  const { isAIPanelOpen } = uiState;

  const panelClasses = `
    bg-white
    fixed top-0 right-0 h-full z-40
    transition-transform duration-300 ease-in-out
    w-80 max-w-[90vw]
    ${isAIPanelOpen ? 'translate-x-0' : 'translate-x-full'}
    md:static md:translate-x-0 md:border-l md:border-gray-200
    ${isAIPanelCollapsed ? 'md:w-12' : 'md:w-80'}
  `;

  return (
    <div className={panelClasses}>
      {isAIPanelCollapsed ? (
        <div className="flex flex-col items-center w-full">
          <button
            onClick={toggleAIPanel}
            className="mt-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Open AI Panel"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="mt-4 transform -rotate-90 text-xs font-medium text-gray-500 whitespace-nowrap">
            AI Generate
          </div>
          <div className="mt-8 p-2 text-purple-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">AI Generate</h3>
              </div>
              <button
                onClick={toggleAIPanel}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white rounded transition-colors"
                title="Collapse AI Panel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Generate images from your canvas
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-xs text-red-600 hover:text-red-800 mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Key Status */}
          {!apiKey && (
            <div className="p-4 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <Key className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">API Key Required</span>
              </div>
              <p className="text-xs text-yellow-700 mb-3">
                Enter your OpenRouter API key to start generating images
              </p>
              <button
                onClick={() => showApiKeyModal(true)}
                className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
              >
                Set API Key
              </button>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 space-y-4">
              <PromptInput />
              <GenerationControls />
            </div>

            <div className="flex-1 overflow-y-auto">
              {generatedImages.length > 0 ? (
                <GeneratedImageDisplay />
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm">No images generated yet</p>
                  <p className="text-xs mt-1">
                    Enter a prompt and click generate to create AI images from your canvas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Powered by OpenRouter</span>
              {apiKey && (
                <span className="text-green-600">
                  API Key Set
                </span>
              )}
            </div>
          </div>
          <ApiKeyModal />
        </div>
      )}
    </div>
  );
}