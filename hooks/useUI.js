'use client';

import { useState, useCallback } from 'react';

/**
 * Hook to manage UI state, particularly for mobile panel visibility.
 */
export const useUI = () => {
  const [isToolPanelOpen, setIsToolPanelOpen] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  // Toggle tool panel, ensuring AI panel is closed
  const toggleToolPanel = useCallback(() => {
    setIsToolPanelOpen(prev => {
      if (!prev) setIsAIPanelOpen(false); // Close AI panel if opening tool panel
      return !prev;
    });
  }, []);

  // Toggle AI panel, ensuring tool panel is closed
  const toggleAIPanel = useCallback(() => {
    setIsAIPanelOpen(prev => {
      if (!prev) setIsToolPanelOpen(false); // Close tool panel if opening AI panel
      return !prev;
    });
  }, []);

  // Close all panels
  const closePanels = useCallback(() => {
    setIsToolPanelOpen(false);
    setIsAIPanelOpen(false);
  }, []);

  return {
    isToolPanelOpen,
    isAIPanelOpen,
    toggleToolPanel,
    toggleAIPanel,
    closePanels,
  };
};
