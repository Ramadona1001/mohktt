import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Image, Circle } from 'react-konva'
import api from '../utils/api'
import toast from 'react-hot-toast'

// Simple image loader hook
function useImage(src) {
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!src) return
    
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImage(img)
      setLoading(false)
    }
    img.onerror = (err) => {
      setError(err)
      setLoading(false)
    }
    img.src = src
  }, [src])

  return [image, loading, error]
}

export default function BlueprintCanvas({ blueprint, projectId }) {
  // Construct full URL for blueprint image
  const imageUrl = blueprint?.file 
    ? (blueprint.file.startsWith('http') ? blueprint.file : `http://localhost:8000${blueprint.file}`)
    : ''
  const [image, loading, error] = useImage(imageUrl)
  const [pins, setPins] = useState([])
  const [selectedPin, setSelectedPin] = useState(null)
  const stageRef = useRef(null)

  useEffect(() => {
    if (blueprint?.pins) {
      setPins(blueprint.pins)
    }
  }, [blueprint])

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      const stage = e.target.getStage()
      const pointerPos = stage.getPointerPosition()
      const stageWidth = stage.width()
      const stageHeight = stage.height()
      
      // Normalize coordinates (0-1)
      const x = pointerPos.x / stageWidth
      const y = pointerPos.y / stageHeight

      // Create new pin
      const newPin = {
        x,
        y,
        label: `Pin ${pins.length + 1}`,
      }

      // Save to backend
      api.post('/projects/pins/', {
        blueprint: blueprint.id,
        x,
        y,
        label: newPin.label,
      })
        .then((response) => {
          setPins([...pins, response.data])
          toast.success('Pin added successfully')
        })
        .catch((error) => {
          toast.error('Failed to add pin')
          console.error(error)
        })
    }
  }

  const handlePinClick = (pin) => {
    setSelectedPin(pin)
  }

  if (loading) {
    return <div className="text-center py-8">Loading blueprint...</div>
  }
  
  if (error || !image) {
    return <div className="text-center py-8 text-red-600">Failed to load blueprint</div>
  }

  const stageWidth = 800
  const stageHeight = (image.height / image.width) * stageWidth

  return (
    <div className="border rounded-lg overflow-auto bg-gray-100 p-4">
      <Stage
        width={stageWidth}
        height={stageHeight}
        onClick={handleStageClick}
        ref={stageRef}
      >
        <Layer>
          <Image image={image} width={stageWidth} height={stageHeight} />
          {pins.map((pin) => (
            <Circle
              key={pin.id}
              x={pin.x * stageWidth}
              y={pin.y * stageHeight}
              radius={8}
              fill="red"
              stroke="white"
              strokeWidth={2}
              onClick={() => handlePinClick(pin)}
              draggable
              onDragEnd={(e) => {
                const newX = e.target.x() / stageWidth
                const newY = e.target.y() / stageHeight
                api.patch(`/projects/pins/${pin.id}/`, {
                  x: newX,
                  y: newY,
                })
                  .then(() => {
                    setPins(pins.map(p => p.id === pin.id ? { ...p, x: newX, y: newY } : p))
                  })
                  .catch(() => toast.error('Failed to update pin'))
              }}
            />
          ))}
        </Layer>
      </Stage>
      {selectedPin && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-2">{selectedPin.label}</h3>
          <p className="text-sm text-gray-600">Tasks: {selectedPin.task_count || 0}</p>
        </div>
      )}
    </div>
  )
}

