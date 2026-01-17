'use client';

/**
 * Image validation utilities
 * Prevents crashes from excessively large images
 */

// Maximum file size: 10MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

// Maximum dimension: 4096px (standard for most web applications)
export const MAX_IMAGE_DIMENSION = 4096;

/**
 * Validates an image file before loading
 * @param {File} file - The image file to validate
 * @returns {Promise<{valid: boolean, error?: string, width?: number, height?: number}>}
 */
export async function validateImageFile(file) {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File is not an image' };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Image too large (${sizeMB}MB). Maximum size is ${maxMB}MB`
    };
  }

  // Check dimensions by loading the image
  try {
    const dimensions = await getImageDimensions(file);

    if (dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION) {
      return {
        valid: false,
        error: `Image dimensions too large (${dimensions.width}x${dimensions.height}). Maximum is ${MAX_IMAGE_DIMENSION}px`,
        ...dimensions
      };
    }

    return { valid: true, ...dimensions };
  } catch (error) {
    return { valid: false, error: 'Failed to read image dimensions' };
  }
}

/**
 * Gets the dimensions of an image file
 * @param {File} file - The image file
 * @returns {Promise<{width: number, height: number}>}
 */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Validates a data URL image
 * @param {string} dataUrl - The data URL to validate
 * @returns {Promise<{valid: boolean, error?: string, width?: number, height?: number}>}
 */
export async function validateDataUrl(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return { valid: false, error: 'Invalid image data URL' };
  }

  // Check base64 size (rough estimate - base64 is ~33% larger than binary)
  const base64Size = dataUrl.length * 0.75;
  if (base64Size > MAX_IMAGE_SIZE) {
    const sizeMB = (base64Size / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Image too large (~${sizeMB}MB). Maximum size is ${maxMB}MB`
    };
  }

  // Check dimensions
  try {
    const dimensions = await getDataUrlDimensions(dataUrl);

    if (dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION) {
      return {
        valid: false,
        error: `Image dimensions too large (${dimensions.width}x${dimensions.height}). Maximum is ${MAX_IMAGE_DIMENSION}px`,
        ...dimensions
      };
    }

    return { valid: true, ...dimensions };
  } catch (error) {
    return { valid: false, error: 'Failed to read image dimensions' };
  }
}

/**
 * Gets dimensions from a data URL
 * @param {string} dataUrl - The data URL
 * @returns {Promise<{width: number, height: number}>}
 */
export function getDataUrlDimensions(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image from data URL'));
    };

    img.src = dataUrl;
  });
}

const imageValidation = {
  MAX_IMAGE_SIZE,
  MAX_IMAGE_DIMENSION,
  validateImageFile,
  validateDataUrl,
  getImageDimensions,
  getDataUrlDimensions
};

export default imageValidation;
