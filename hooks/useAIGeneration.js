'use client';

import { useCallback, useEffect } from 'react';
import { useCanvas } from '../context/CanvasContext';
import { aiService } from '../services/aiService';

/**
 * Custom hook for managing AI image generation
 */
export function useAIGeneration() {
  const { state, actions } = useCanvas();
  const { ai, canvas } = state;

  // Load stored API key on mount
  useEffect(() => {
    const storedApiKey = aiService.getStoredApiKey();
    if (storedApiKey && !ai.apiKey) {
      actions.setApiKey(storedApiKey);
    }
  }, []);

  // Store API key in localStorage when it changes
  useEffect(() => {
    if (ai.apiKey) {
      aiService.storeApiKey(ai.apiKey);
    }
  }, [ai.apiKey]);

  /**
   * Loads generated images from localStorage
   */
  const loadStoredImages = useCallback(() => {
    try {
      const stored = localStorage.getItem('ai_generated_images');
      if (stored) {
        const images = JSON.parse(stored);
        if (Array.isArray(images)) {
          images.forEach(imageData => {
            if (imageData && typeof imageData === 'object') {
              actions.addGeneratedImage(imageData);
            }
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load stored images:', error);
    }
  }, [actions]);

  /**
   * Saves generated images to localStorage
   */
  const saveImagesToStorage = useCallback(() => {
    try {
      localStorage.setItem('ai_generated_images', JSON.stringify(ai.generatedImages));
    } catch (error) {
      console.warn('Failed to save images to storage:', error);
    }
  }, [ai.generatedImages]);

  // Save images to localStorage when they change
  useEffect(() => {
    if (ai.generatedImages.length > 0) {
      saveImagesToStorage();
    }
  }, [ai.generatedImages, saveImagesToStorage]);

  /**
   * Generates an image using AI
   */
  const generateImage = useCallback(async (prompt, progressCallback = null) => {
    // Validation
    if (!prompt || !prompt.trim()) {
      actions.setAIError('Please enter a prompt for image generation');
      return;
    }

    if (!canvas) {
      actions.setAIError('Canvas is not available');
      return;
    }

    const apiKey = ai.apiKey || aiService.getStoredApiKey();
    if (!apiKey) {
      actions.showApiKeyModal(true);
      return;
    }

    if (!aiService.validateApiKey(apiKey)) {
      actions.setAIError('Invalid API key format');
      actions.showApiKeyModal(true);
      return;
    }

    actions.clearAIError();
    actions.setAIGenerating(true);

    try {
      // Convert canvas to base64
      const canvasBase64 = aiService.canvasToBase64(canvas);
      
      // Progress callback wrapper
      const onProgress = progressCallback ? (data) => {
        progressCallback(data);
      } : null;

      // Generate image
      const imageUrl = await aiService.generateImage(
        prompt.trim(),
        canvasBase64,
        apiKey,
        onProgress
      );

      // Process the generated image
      let finalImageData;
      if (imageUrl.startsWith('data:image/')) {
        // Already base64
        finalImageData = imageUrl;
      } else {
        // Download and convert to base64
        finalImageData = await aiService.downloadImageAsBase64(imageUrl);
      }

      // Create image data object
      const imageData = {
        id: Date.now() + Math.random(),
        url: finalImageData,
        prompt: prompt.trim(),
        timestamp: new Date().toISOString(),
        originalCanvasState: canvasBase64
      };

      actions.addGeneratedImage(imageData);
      
      return imageData;

    } catch (error) {
      console.error('Image generation failed:', error);
      actions.setAIError(error.message || 'Failed to generate image');
      throw error;
    } finally {
      actions.setAIGenerating(false);
    }
  }, [canvas, ai.apiKey, actions]);

  /**
   * Downloads a generated image
   */
  const downloadImage = useCallback((imageData) => {
    if (!imageData || !imageData.url) {
      console.error('Invalid image data for download');
      return;
    }

    try {
      const link = document.createElement('a');
      const filename = `ai-generated-${imageData.prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.png`;
      
      link.download = filename;
      link.href = imageData.url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  }, []);

  /**
   * Copies image to clipboard
   */
  const copyImageToClipboard = useCallback(async (imageData) => {
    if (!imageData || !imageData.url) {
      console.error('Invalid image data for clipboard copy');
      return false;
    }

    try {
      // Convert base64 to blob
      const response = await fetch(imageData.url);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      return true;
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
      return false;
    }
  }, []);

  /**
   * Adds generated image to canvas
   */
  const addImageToCanvas = useCallback(async (imageData) => {
    if (!imageData || !imageData.url || !canvas) {
      console.error('Cannot add image to canvas - missing data or canvas');
      return;
    }

    try {
      const { FabricImage } = await import('fabric');
      
      const img = await FabricImage.fromURL(imageData.url, {
        crossOrigin: 'anonymous'
      });
      
      // Scale image to fit canvas appropriately
      const maxWidth = canvas.width * 0.6;
      const maxHeight = canvas.height * 0.6;
      
      if (img.width > maxWidth || img.height > maxHeight) {
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        img.scale(scale);
      }

      // Position image in center
      img.set({
        left: (canvas.width - img.getScaledWidth()) / 2,
        top: (canvas.height - img.getScaledHeight()) / 2,
        selectable: true
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      actions.saveState();
    } catch (error) {
      console.error('Failed to add image to canvas:', error);
    }
  }, [canvas, actions]);

  /**
   * Sets up API key
   */
  const setupApiKey = useCallback((apiKey) => {
    if (!apiKey || !aiService.validateApiKey(apiKey)) {
      actions.setAIError('Please enter a valid API key');
      return false;
    }

    actions.setApiKey(apiKey);
    actions.showApiKeyModal(false);
    actions.clearAIError();
    return true;
  }, [actions]);

  /**
   * Clears API key
   */
  const clearApiKey = useCallback(() => {
    actions.setApiKey(null);
    aiService.clearStoredApiKey();
  }, [actions]);

  /**
   * Retry last failed generation
   */
  const retryGeneration = useCallback(() => {
    if (ai.currentPrompt) {
      generateImage(ai.currentPrompt);
    }
  }, [ai.currentPrompt, generateImage]);

  return {
    // State
    isGenerating: ai.isGenerating,
    generatedImages: ai.generatedImages,
    currentPrompt: ai.currentPrompt,
    error: ai.error,
    apiKey: ai.apiKey,
    isApiKeyModalOpen: ai.showApiKeyModal,
    isAIPanelCollapsed: ai.isAIPanelCollapsed,
    hasCanvas: !!canvas,

    // Actions
    generateImage,
    downloadImage,
    copyImageToClipboard,
    addImageToCanvas,
    setupApiKey,
    clearApiKey,
    retryGeneration,
    loadStoredImages,

    // Context actions
    setPrompt: actions.setAIPrompt,
    clearError: actions.clearAIError,
    showApiKeyModal: actions.showApiKeyModal,
    toggleAIPanel: actions.toggleAIPanel,
    clearGeneratedImages: actions.clearGeneratedImages,
    removeGeneratedImage: actions.removeGeneratedImage
  };
}

export default useAIGeneration;