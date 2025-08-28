'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Plus, 
  X, 
  Eye, 
  Calendar,
  Image as ImageIcon,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAIGeneration } from '../../hooks/useAIGeneration';

/**
 * Generated Image Display component - Shows generated images with controls
 */
export default function GeneratedImageDisplay() {
  const {
    generatedImages,
    downloadImage,
    copyImageToClipboard,
    addImageToCanvas,
    removeGeneratedImage
  } = useAIGeneration();

  const [selectedImage, setSelectedImage] = useState(null);
  const [copyStatus, setCopyStatus] = useState({});

  const handleCopyToClipboard = async (imageData, index) => {
    try {
      const success = await copyImageToClipboard(imageData);
      if (success) {
        setCopyStatus(prev => ({ ...prev, [index]: true }));
        setTimeout(() => {
          setCopyStatus(prev => ({ ...prev, [index]: false }));
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy image:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncatePrompt = (prompt, maxLength = 60) => {
    if (prompt.length <= maxLength) return prompt;
    return prompt.slice(0, maxLength) + '...';
  };

  if (generatedImages.length === 0) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
          <ImageIcon className="w-4 h-4" />
          <span>Generated Images</span>
        </h4>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {generatedImages.length} image{generatedImages.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {generatedImages.map((imageData, index) => (
          <div 
            key={imageData.id || index}
            className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
          >
            {/* Image Preview */}
            <div className="relative group">
              <img
                src={imageData.url}
                alt={`Generated: ${truncatePrompt(imageData.prompt, 30)}`}
                className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(imageData)}
                loading="lazy"
              />
              
              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setSelectedImage(imageData)}
                  className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full text-gray-700 transition-all"
                  title="View full size"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeGeneratedImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Image Info */}
            <div className="p-3 space-y-2">
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>Prompt:</strong> {truncatePrompt(imageData.prompt)}
              </p>
              
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatTimestamp(imageData.timestamp)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => addImageToCanvas(imageData)}
                  className="flex-1 py-1.5 px-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                  title="Add to canvas"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add to Canvas</span>
                </button>

                <button
                  onClick={() => downloadImage(imageData)}
                  className="py-1.5 px-2 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors flex items-center justify-center"
                  title="Download image"
                >
                  <Download className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleCopyToClipboard(imageData, index)}
                  className="py-1.5 px-2 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors flex items-center justify-center"
                  title="Copy to clipboard"
                >
                  {copyStatus[index] ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Size Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl max-h-[90vh] w-full bg-white rounded-lg overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Generated Image</h3>
                <p className="text-sm text-gray-600 mt-1">{formatTimestamp(selectedImage.timestamp)}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <div className="flex justify-center mb-4">
                <img
                  src={selectedImage.url}
                  alt={`Generated: ${selectedImage.prompt}`}
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                />
              </div>

              {/* Image Details */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prompt:</label>
                  <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                    {selectedImage.prompt}
                  </p>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      addImageToCanvas(selectedImage);
                      setSelectedImage(null);
                    }}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Canvas</span>
                  </button>

                  <button
                    onClick={() => downloadImage(selectedImage)}
                    className="py-2 px-4 bg-gray-600 text-white font-medium rounded hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedImage.url;
                      link.target = '_blank';
                      link.click();
                    }}
                    className="py-2 px-4 bg-gray-600 text-white font-medium rounded hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}