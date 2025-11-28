import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move, Pin } from 'lucide-react';

export default function BlueprintViewer({ blueprint, onPinClick, onAddPin, canEdit = false }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [mouseDownPos, setMouseDownPos] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [addPinMode, setAddPinMode] = useState(false);

  useEffect(() => {
    if (blueprint?.file) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        setImageLoaded(true);
        // Fit to screen initially
        setTimeout(() => fitToScreen(), 100);
      };
      img.onerror = () => {
        console.error('Failed to load blueprint image');
        setImageLoaded(false);
      };
      // Construct full URL for blueprint image
      const imageUrl = blueprint.file.startsWith('http') 
        ? blueprint.file 
        : `http://localhost:8000${blueprint.file}`;
      img.src = imageUrl;
    } else {
      setImageSize({ width: 0, height: 0 });
      setImageLoaded(false);
    }
  }, [blueprint]);

  const fitToScreen = () => {
    if (!containerRef.current || !imageSize.width) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scaleX = containerWidth / imageSize.width;
    const scaleY = containerHeight / imageSize.height;
    const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
    
    setScale(newScale);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5)); // Max 5x zoom
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1)); // Min 0.1x zoom
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left mouse button
      // If clicking on a pin, don't start panning
      if (e.target.closest('.pin-marker')) {
        return;
      }
      setMouseDownPos({ x: e.clientX, y: e.clientY });
      // Only start panning if not in add pin mode
      if (!addPinMode) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && mouseDownPos) {
      // Check if mouse moved significantly (more than 5px) - then it's a drag
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) + Math.pow(e.clientY - mouseDownPos.y, 2)
      );
      if (moveDistance > 5) {
        setPosition({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    }
  };

  const handleMouseUp = (e) => {
    if (mouseDownPos) {
      // Check if it was a click (not a drag)
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) + Math.pow(e.clientY - mouseDownPos.y, 2)
      );
      
      // If in add pin mode or it was a small movement, treat as click
      if ((addPinMode || moveDistance <= 5) && canEdit && onAddPin && imageSize.width > 0 && imageSize.height > 0) {
        // It was a click - trigger add pin
        const rect = containerRef.current.getBoundingClientRect();
        const containerX = e.clientX - rect.left;
        const containerY = e.clientY - rect.top;
        
        // Calculate position relative to the transformed canvas
        const canvasX = (containerX - position.x) / scale;
        const canvasY = (containerY - position.y) / scale;
        
        // Normalize coordinates (0-1) based on actual image dimensions
        const normalizedX = canvasX / imageSize.width;
        const normalizedY = canvasY / imageSize.height;
        
        // Validate coordinates are within bounds
        if (normalizedX >= 0 && normalizedX <= 1 && normalizedY >= 0 && normalizedY <= 1) {
          onAddPin(normalizedX, normalizedY);
        }
      }
    }
    setIsPanning(false);
    setMouseDownPos(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };


  if (!blueprint?.file) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No blueprint uploaded</p>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-200 rounded"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-200 rounded"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={fitToScreen}
          className="p-2 hover:bg-gray-200 rounded"
          title="Fit to Screen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        {canEdit && onAddPin && (
          <button
            onClick={() => {
              setAddPinMode(!addPinMode);
              setIsPanning(false);
            }}
            className={`p-2 rounded ${addPinMode ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            title={addPinMode ? "Click to add pins (Active)" : "Click to add pins"}
          >
            <Pin className="w-5 h-5" />
          </button>
        )}
        <div className="px-3 py-2 text-sm text-gray-700">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className={`relative w-full h-[600px] overflow-hidden ${addPinMode ? 'cursor-crosshair' : 'cursor-move'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          ref={canvasRef}
          className="absolute inset-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          <img
            src={blueprint.file.startsWith('http') ? blueprint.file : `http://localhost:8000${blueprint.file}`}
            alt="Blueprint"
            className="max-w-none"
            style={{
              width: imageSize.width || 'auto',
              height: imageSize.height || 'auto',
            }}
            draggable={false}
          />
          
          {/* Pins Overlay */}
          {blueprint.pins && blueprint.pins.map((pin) => (
            <div
              key={pin.id}
              className="absolute cursor-pointer group"
              style={{
                left: `${pin.x * 100}%`,
                top: `${pin.y * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onPinClick?.(pin);
              }}
            >
              <div className="pin-marker w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">{pin.id}</span>
              </div>
              {pin.label && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {pin.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {canEdit && (
        <div className={`absolute bottom-4 left-4 px-4 py-2 rounded-lg text-sm ${
          addPinMode ? 'bg-green-500/90 text-white' : 'bg-blue-500/90 text-white'
        }`}>
          {addPinMode 
            ? '✓ Pin mode active - Click on blueprint to add task' 
            : 'Click the pin icon to enable adding tasks'}
        </div>
      )}
    </div>
  );
}

