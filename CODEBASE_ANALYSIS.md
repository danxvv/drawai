# CoDrawing Codebase Analysis & Fix Plan

**Analysis Date:** January 17, 2026
**Branch:** claude/analyze-code-plan-fixes-igdRV

## Executive Summary

The CoDrawing codebase is well-structured and uses modern technologies (Next.js 15.5.2, React 19.1.0, Fabric.js 6.7.1). However, several issues need attention across security, error handling, performance, and code quality areas.

---

## Issues Identified

### Critical Issues (Security & Stability)

| # | Issue | Location | Risk |
|---|-------|----------|------|
| 1 | **No file size/dimension validation for image uploads** | `ToolPanel.js:42`, `FabricCanvas.js:262` | HIGH |
| 2 | **Unlimited undo/redo history** - Can consume unlimited memory | `CanvasContext.js:151` | HIGH |
| 3 | **No React Error Boundaries** - Unhandled errors crash app | All components | HIGH |

### High Priority Issues

| # | Issue | Location | Risk |
|---|-------|----------|------|
| 4 | **API key stored in plaintext localStorage** - XSS vulnerability | `aiService.js:272-295` | MEDIUM |
| 5 | **Large base64 images in localStorage** - 5MB limit breach | `useAIGeneration.js:54-55` | MEDIUM |
| 6 | **Inconsistent Fabric.js syntax** - Callback vs Promise mismatch | `FabricCanvas.js:262` | LOW |
| 7 | **No API retry logic** - Network failures not handled | `aiService.js:52-89` | MEDIUM |
| 8 | **No test coverage** - No unit/integration tests | Entire project | HIGH |

### Medium Priority Issues

| # | Issue | Location | Risk |
|---|-------|----------|------|
| 9 | **Missing ARIA live regions** - Error notifications not announced | UI components | LOW |
| 10 | **Silent error handling** - Errors logged but not shown to user | Multiple files | LOW |
| 11 | **No offline detection** - AI fails silently without network | `aiService.js` | LOW |
| 12 | **Download links use DOM manipulation** - Should use Blob URLs | `ExportButton.js:21-29` | LOW |

### Low Priority (Code Quality)

| # | Issue | Location | Risk |
|---|-------|----------|------|
| 13 | **No TypeScript** - No type safety | Entire project | LOW |
| 14 | **No memoization** - Potential unnecessary re-renders | `FabricCanvas.js` | LOW |
| 15 | **Missing keyboard shortcuts help** - Users unaware of shortcuts | N/A | LOW |

---

## Fix Plan

### Phase 1: Critical Fixes (Security & Stability)

#### 1.1 Add Image Upload Validation
**Files:** `components/Sidebar/ToolPanel.js`, `components/Canvas/FabricCanvas.js`

```javascript
// Add validation constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_DIMENSION = 4096; // 4096px max width/height

// Add validation function
const validateImage = (file, img) => {
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`Image too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
  }
  if (img.width > MAX_IMAGE_DIMENSION || img.height > MAX_IMAGE_DIMENSION) {
    throw new Error(`Image dimensions too large. Maximum is ${MAX_IMAGE_DIMENSION}px`);
  }
};
```

#### 1.2 Limit Undo/Redo History
**File:** `context/CanvasContext.js`

```javascript
const MAX_HISTORY_SIZE = 50;

// In saveState action, limit history array
const newHistory = [...state.history.slice(0, state.historyStep + 1), canvasState];
if (newHistory.length > MAX_HISTORY_SIZE) {
  newHistory.shift(); // Remove oldest entry
}
```

#### 1.3 Add React Error Boundary
**New File:** `components/ErrorBoundary.js`

```javascript
'use client';
import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

### Phase 2: High Priority Fixes

#### 2.1 Improve API Key Storage
**File:** `services/aiService.js`

- Move from localStorage to sessionStorage (clears on browser close)
- Add encryption layer for additional security
- Consider moving to environment variables with server-side proxy

```javascript
// Use sessionStorage instead
const storage = typeof window !== 'undefined' ? window.sessionStorage : null;

// Or implement simple obfuscation (not true encryption, but better than plaintext)
const obfuscate = (str) => btoa(str.split('').reverse().join(''));
const deobfuscate = (str) => atob(str).split('').reverse().join('');
```

#### 2.2 Move Images to IndexedDB
**New File:** `services/imageStorage.js`

Replace localStorage with IndexedDB for generated images:
- No size limit (browser-dependent, usually GBs)
- Asynchronous operations
- Better performance for large binary data

#### 2.3 Fix Fabric.js Promise Syntax
**File:** `components/Canvas/FabricCanvas.js:262`

```javascript
// Before (callback pattern)
fabric.Image.fromURL(url, (img) => { ... });

// After (Promise pattern)
const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
// ... rest of image handling
```

#### 2.4 Add API Retry Logic
**File:** `services/aiService.js`

```javascript
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status < 500) return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
    }
    await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
  }
};
```

#### 2.5 Add Basic Test Suite
**New Files:** `__tests__/` directory

- Add Jest configuration
- Create tests for:
  - CanvasContext reducer
  - aiService functions
  - useAIGeneration hook
  - Component rendering

---

### Phase 3: Medium Priority Improvements

#### 3.1 Add ARIA Live Regions
```javascript
// Add announcement div for screen readers
<div role="status" aria-live="polite" className="sr-only">
  {errorMessage}
</div>
```

#### 3.2 Surface Errors to UI
Replace console.error with user-visible notifications:
```javascript
// Add toast/notification system
dispatch({ type: 'SHOW_NOTIFICATION', payload: { type: 'error', message } });
```

#### 3.3 Add Offline Detection
```javascript
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

#### 3.4 Use Blob URLs for Downloads
```javascript
// Before
const link = document.createElement('a');
link.href = dataUrl;
link.download = filename;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

// After
const blob = await fetch(dataUrl).then(r => r.blob());
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = filename;
link.click();
URL.revokeObjectURL(url);
```

---

### Phase 4: Low Priority Enhancements

#### 4.1 TypeScript Migration (Gradual)
1. Rename files to `.tsx`
2. Add type definitions
3. Start with context and services

#### 4.2 Add Memoization
```javascript
const memoizedValue = useMemo(() => expensiveComputation(), [deps]);
const memoizedCallback = useCallback(() => handler(), [deps]);
```

#### 4.3 Add Keyboard Shortcuts Help Modal
Create `components/KeyboardShortcutsModal.js` showing:
- Ctrl/Cmd + Z: Undo
- Ctrl/Cmd + Shift + Z: Redo
- Delete/Backspace: Delete selection

---

## Implementation Priority Order

| Order | Task | Estimated Complexity |
|-------|------|---------------------|
| 1 | Add Error Boundary | Low |
| 2 | Add image upload validation | Low |
| 3 | Limit undo/redo history | Low |
| 4 | Fix Fabric.js Promise syntax | Low |
| 5 | Add API retry logic | Medium |
| 6 | Surface errors to UI | Medium |
| 7 | Improve API key storage | Medium |
| 8 | Add offline detection | Low |
| 9 | Use Blob URLs for downloads | Low |
| 10 | Move images to IndexedDB | High |
| 11 | Add ARIA live regions | Low |
| 12 | Add test suite | High |
| 13 | TypeScript migration | High |

---

## Files to Create/Modify

### New Files
- `components/ErrorBoundary.js` - React error boundary
- `services/imageStorage.js` - IndexedDB wrapper
- `components/KeyboardShortcutsModal.js` - Help modal
- `__tests__/` - Test directory

### Files to Modify
- `context/CanvasContext.js` - History limit, error handling
- `services/aiService.js` - Retry logic, API key storage
- `hooks/useAIGeneration.js` - IndexedDB integration
- `components/Sidebar/ToolPanel.js` - Image validation
- `components/Canvas/FabricCanvas.js` - Image validation, Promise syntax
- `components/Controls/ExportButton.js` - Blob URLs
- `app/page.js` - Error boundary wrapper

---

## Success Metrics

After implementing these fixes:
- [ ] No crashes from large image uploads
- [ ] Memory usage stays stable during long sessions
- [ ] App gracefully handles errors with user feedback
- [ ] API failures are retried automatically
- [ ] Offline state is detected and communicated
- [ ] All critical paths have test coverage

---

## Notes

- The codebase follows good React patterns overall
- No TODO/FIXME comments found (could be improved with issue tracking)
- Modern tech stack (React 19, Next.js 15, Fabric.js 6)
- Well-organized component structure
