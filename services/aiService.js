'use client';

/**
 * AI Service for OpenRouter API integration
 * Handles image generation using Google Gemini Flash Image Preview model
 */
class AIService {
  constructor() {
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.model = 'google/gemini-2.5-flash-image-preview';
  }

  /**
   * Converts canvas to base64 data URL
   * @param {fabric.Canvas} canvas - The Fabric.js canvas instance
   * @returns {string} Base64 data URL
   */
  canvasToBase64(canvas) {
    if (!canvas) {
      throw new Error('Canvas instance is required');
    }

    return canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });
  }

  /**
   * Generates an image using OpenRouter API with streaming response
   * @param {string} prompt - The text prompt for image generation
   * @param {string} canvasBase64 - Base64 encoded canvas image
   * @param {string} apiKey - OpenRouter API key
   * @param {Function} onProgress - Callback for streaming updates
   * @returns {Promise<string>} Generated image URL or base64
   */
  async generateImage(prompt, canvasBase64, apiKey, onProgress = null) {
    if (!prompt || !prompt.trim()) {
      throw new Error('Prompt is required');
    }

    if (!apiKey || !apiKey.trim()) {
      throw new Error('API key is required');
    }

    if (!canvasBase64) {
      throw new Error('Canvas image is required');
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant specialized in generating high-quality images based on user prompts and canvas context. 

Guidelines for image generation:
- Analyze the provided canvas image to understand the current composition, style, and context
- Generate images that complement or enhance the existing canvas content when relevant
- Maintain artistic coherence with the canvas style (realistic, cartoon, abstract, etc.)
- Create high-quality, detailed images that would fit well in a digital art/painting application
- If the canvas is mostly empty, focus entirely on the user's prompt
- If the canvas has existing content, consider how your generated image could integrate or build upon it
- Aim for images that are suitable for creative and artistic purposes
- Generate images that are appropriate for all audiences
- Focus on creativity, artistic value, and visual appeal

Always respond with a single, high-quality image that best fulfills the user's creative vision.`
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: canvasBase64 } }
              ],
            },
          ],
          modalities: ['image', 'text'],
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      return await this.processStreamingResponse(response, onProgress);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  /**
   * Processes streaming response from OpenRouter API
   * @param {Response} response - Fetch response object
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<string>} Generated image data
   */
  async processStreamingResponse(response, onProgress) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let generatedImageUrl = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last potentially incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              
              // Handle progress updates
              if (onProgress && parsed.choices?.[0]?.delta?.content) {
                onProgress({
                  type: 'progress',
                  content: parsed.choices[0].delta.content
                });
              }

              // Look for generated images in the response
              if (parsed.choices?.[0]?.message?.content) {
                const content = parsed.choices[0].message.content;
                const imageUrl = this.extractImageFromContent(content);
                if (imageUrl) {
                  generatedImageUrl = imageUrl;
                }
              }

              // Check for images in delta.images array (Gemini Flash Image Preview format)
              if (parsed.choices?.[0]?.delta?.images) {
                const images = parsed.choices[0].delta.images;
                if (Array.isArray(images) && images.length > 0) {
                  const imageData = images[0];
                  if (imageData?.image_url?.url) {
                    generatedImageUrl = imageData.image_url.url;
                  }
                }
              }

              // Also check delta content for images
              if (parsed.choices?.[0]?.delta?.content) {
                const deltaContent = parsed.choices[0].delta.content;
                const imageUrl = this.extractImageFromContent(deltaContent);
                if (imageUrl) {
                  generatedImageUrl = imageUrl;
                }
              }

            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }

      if (!generatedImageUrl) {
        throw new Error('No image generated in the response');
      }

      return generatedImageUrl;

    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Extracts image URL or base64 data from response content
   * @param {string} content - Response content
   * @returns {string|null} Image URL or base64 data
   */
  extractImageFromContent(content) {
    if (!content) return null;

    // Look for base64 image data
    const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
    if (base64Match) {
      return base64Match[0];
    }

    // Look for HTTP/HTTPS URLs
    const urlMatch = content.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+\.(png|jpg|jpeg|gif|webp)/i);
    if (urlMatch) {
      return urlMatch[0];
    }

    // Look for markdown image syntax
    const markdownMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    if (markdownMatch) {
      return markdownMatch[1];
    }

    return null;
  }

  /**
   * Downloads image from URL and converts to base64
   * @param {string} imageUrl - URL of the image to download
   * @returns {Promise<string>} Base64 data URL
   */
  async downloadImageAsBase64(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to download image:', error);
      throw error;
    }
  }

  /**
   * Validates API key format
   * @param {string} apiKey - API key to validate
   * @returns {boolean} Whether the API key appears valid
   */
  validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    // Basic validation - check if it's not empty and has reasonable length
    return apiKey.trim().length > 10;
  }

  /**
   * Gets stored API key from localStorage
   * @returns {string|null} Stored API key or null
   */
  getStoredApiKey() {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem('openrouter_api_key');
    } catch (error) {
      console.warn('Failed to get stored API key:', error);
      return null;
    }
  }

  /**
   * Stores API key in localStorage
   * @param {string} apiKey - API key to store
   */
  storeApiKey(apiKey) {
    if (typeof window === 'undefined') return;
    
    try {
      if (apiKey && apiKey.trim()) {
        localStorage.setItem('openrouter_api_key', apiKey.trim());
      } else {
        localStorage.removeItem('openrouter_api_key');
      }
    } catch (error) {
      console.warn('Failed to store API key:', error);
    }
  }

  /**
   * Clears stored API key
   */
  clearStoredApiKey() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('openrouter_api_key');
    } catch (error) {
      console.warn('Failed to clear stored API key:', error);
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;