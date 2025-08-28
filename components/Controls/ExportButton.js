'use client';

import React, { useState } from 'react';
import { Download, Copy, Check, X } from 'lucide-react';
import { useCanvas } from '../../context/CanvasContext';

export default function ExportButton() {
  const { actions } = useCanvas();
  const [showModal, setShowModal] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const dataURL = actions.exportCanvas();
    if (dataURL) {
      setExportData(dataURL);
      setShowModal(true);
    }
  };

  const handleDownload = () => {
    if (exportData) {
      const link = document.createElement('a');
      link.download = `painting-${new Date().toISOString().split('T')[0]}.png`;
      link.href = exportData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowModal(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (exportData) {
      try {
        // Convert data URL to blob
        const response = await fetch(exportData);
        const blob = await response.blob();
        
        // Copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback: copy the base64 string
        try {
          await navigator.clipboard.writeText(exportData);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (fallbackErr) {
          console.error('Failed to copy to clipboard:', fallbackErr);
        }
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setExportData(null);
    setCopied(false);
  };

  return (
    <>
      <button
        onClick={handleExport}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
        title="Export Canvas"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">Export</span>
      </button>

      {/* Export Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Export Canvas</h3>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              {exportData && (
                <div className="space-y-4">
                  {/* Preview Image */}
                  <div className="flex justify-center">
                    <div className="max-w-full max-h-96 overflow-hidden border border-gray-200 rounded-lg">
                      <img 
                        src={exportData} 
                        alt="Canvas Export Preview" 
                        className="max-w-full max-h-96 object-contain"
                      />
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </button>

                    <button
                      onClick={handleCopyToClipboard}
                      className={`
                        flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-all
                        ${copied 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy to Clipboard</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Base64 Data (Collapsed) */}
                  <details className="border border-gray-200 rounded-lg">
                    <summary className="px-4 py-2 bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-100">
                      View Base64 Data
                    </summary>
                    <div className="p-4 bg-gray-50">
                      <textarea
                        readOnly
                        value={exportData}
                        className="w-full h-32 p-2 text-xs font-mono bg-white border border-gray-300 rounded resize-none"
                        onClick={(e) => e.target.select()}
                      />
                      <p className="mt-2 text-xs text-gray-600">
                        Click in the text area to select all and copy the base64 data.
                      </p>
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}