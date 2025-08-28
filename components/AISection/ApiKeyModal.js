'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, ExternalLink, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useAIGeneration } from '../../hooks/useAIGeneration';

/**
 * API Key Modal component for setting OpenRouter API key
 */
export default function ApiKeyModal() {
  const { setupApiKey, isApiKeyModalOpen, showApiKeyModal, apiKey, clearApiKey } = useAIGeneration();
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize with existing API key
  useEffect(() => {
    if (apiKey) {
      setInputValue(apiKey);
    }
  }, [apiKey]);

  const handleClose = () => {
    showApiKeyModal(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const trimmedKey = inputValue.trim();
      
      if (!trimmedKey) {
        setError('Please enter an API key');
        return;
      }

      if (trimmedKey.length < 10) {
        setError('API key appears to be too short');
        return;
      }

      const success = setupApiKey(trimmedKey);
      if (success) {
        handleClose();
      }
    } catch (error) {
      setError('Failed to save API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    clearApiKey();
    setInputValue('');
    handleClose();
  };

  if (!isApiKeyModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Key className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">OpenRouter API Key</h3>
                <p className="text-sm text-gray-600">Required for AI image generation</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter your OpenRouter API key..."
                  className="
                    w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    text-sm font-mono
                  "
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Current Status */}
            {apiKey && !error && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">API key is currently set</span>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-blue-900 text-sm">How to get your API key:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Visit OpenRouter and create an account</li>
                <li>Go to the API Keys section</li>
                <li>Create a new API key</li>
                <li>Copy and paste it here</li>
              </ol>
              <div className="pt-2">
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Privacy:</strong> Your API key is stored locally in your browser and never sent to our servers. 
                It&apos;s only used to communicate directly with OpenRouter&apos;s API.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="
                  flex-1 py-2 px-4 bg-purple-600 text-white font-medium rounded-lg
                  hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-colors duration-200
                  flex items-center justify-center space-x-2
                "
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save API Key</span>
                  </>
                )}
              </button>

              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="
                    py-2 px-4 bg-red-100 text-red-700 font-medium rounded-lg
                    hover:bg-red-200 transition-colors duration-200
                  "
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="
                  py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg
                  hover:bg-gray-200 transition-colors duration-200
                "
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}