import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Sun, Contrast, RotateCcw, ZoomIn, ZoomOut,
  Sparkles, Download, Loader2, Check, X, AlertCircle, RefreshCw, Users, UserX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { getFaceGuideBox, type PassportSpec } from '@/lib/passport-specs'
import { removeBackground, type RemovalMethod, type RemovalProgress } from '@/lib/background-removal'
import { detectFaces, type FaceDetectionResult } from '@/lib/face-detection'
import { cn } from '@/lib/utils'

interface PhotoEditorProps {
  imageDataUrl: string
  spec: PassportSpec
  onProcessedImage: (dataUrl: string) => void
  onReset: () => void
}

export function PhotoEditor({ imageDataUrl, spec, onProcessedImage, onReset }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)

  // Transform state
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  // Background removal state
  const [isRemovingBg, setIsRemovingBg] = useState(false)
  const [bgProgress, setBgProgress] = useState<RemovalProgress | null>(null)
  const [bgRemovalError, setBgRemovalError] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState(imageDataUrl)
  const [bgRemoved, setBgRemoved] = useState(false)
  const [usedMethod, setUsedMethod] = useState<RemovalMethod | null>(null)

  // Face detection state
  const [faceDetection, setFaceDetection] = useState<FaceDetectionResult | null>(null)
  const [isDetectingFace, setIsDetectingFace] = useState(false)

  // Canvas dimensions based on aspect ratio
  const maxCanvasWidth = 400
  const aspectRatio = spec.width / spec.height
  const canvasWidth = maxCanvasWidth
  const canvasHeight = Math.round(canvasWidth / aspectRatio)

  // Load image and set initial transform
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img

      // Calculate scale to fit image in canvas with some padding
      const scaleX = canvasWidth / img.width
      const scaleY = canvasHeight / img.height
      const fitScale = Math.max(scaleX, scaleY) * 1.1

      setScale(fitScale)
      setOffsetX((canvasWidth - img.width * fitScale) / 2)
      setOffsetY((canvasHeight - img.height * fitScale) / 2)
    }
    img.src = currentImageUrl
  }, [currentImageUrl, canvasWidth, canvasHeight])

  // Run face detection on initial image
  useEffect(() => {
    const runFaceDetection = async () => {
      setIsDetectingFace(true)
      try {
        const result = await detectFaces(imageDataUrl)
        setFaceDetection(result)
      } catch (error) {
        console.error('Face detection error:', error)
      } finally {
        setIsDetectingFace(false)
      }
    }
    runFaceDetection()
  }, [imageDataUrl])

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current

    if (!canvas || !ctx || !img) return

    // Clear canvas
    ctx.fillStyle = spec.backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Save context state
    ctx.save()

    // Apply brightness/contrast filter
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`

    // Draw image with current transform
    ctx.drawImage(
      img,
      offsetX,
      offsetY,
      img.width * scale,
      img.height * scale
    )

    // Restore context
    ctx.restore()

    // Draw face guide overlay
    const guide = getFaceGuideBox(canvasWidth, canvasHeight, spec)

    // Darken areas outside the face guide
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'

    // Top
    ctx.fillRect(0, 0, canvasWidth, guide.y)
    // Bottom
    ctx.fillRect(0, guide.y + guide.height, canvasWidth, canvasHeight - guide.y - guide.height)
    // Left
    ctx.fillRect(0, guide.y, guide.x, guide.height)
    // Right
    ctx.fillRect(guide.x + guide.width, guide.y, canvasWidth - guide.x - guide.width, guide.height)

    // Draw face guide border
    ctx.strokeStyle = '#2D968C'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.strokeRect(guide.x, guide.y, guide.width, guide.height)
    ctx.setLineDash([])

    // Draw center crosshair for eyes
    const centerX = guide.x + guide.width / 2
    const centerY = guide.y + guide.height * 0.35 // Eye level
    ctx.strokeStyle = 'rgba(45, 150, 140, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(centerX - 20, centerY)
    ctx.lineTo(centerX + 20, centerY)
    ctx.moveTo(centerX, centerY - 10)
    ctx.lineTo(centerX, centerY + 10)
    ctx.stroke()

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = '11px Inter, sans-serif'
    ctx.fillText('Position face in this area', guide.x + 5, guide.y + 16)
    ctx.fillText('Eyes on crosshair', guide.x + 5, centerY + 25)

  }, [brightness, contrast, scale, offsetX, offsetY, canvasWidth, canvasHeight, spec])

  // Redraw on state changes
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastMousePos.x
    const deltaY = e.clientY - lastMousePos.y

    setOffsetX(prev => prev + deltaX)
    setOffsetY(prev => prev + deltaY)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    handleZoom(delta)
  }

  // Zoom with center point preservation
  const handleZoom = (factor: number) => {
    const newScale = Math.max(0.1, Math.min(5, scale * factor))

    // Zoom towards center
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2

    const scaleChange = newScale / scale
    const newOffsetX = centerX - (centerX - offsetX) * scaleChange
    const newOffsetY = centerY - (centerY - offsetY) * scaleChange

    setScale(newScale)
    setOffsetX(newOffsetX)
    setOffsetY(newOffsetY)
  }

  // Background removal with dual-method support
  const handleRemoveBackground = async (preferredMethod?: RemovalMethod) => {
    setIsRemovingBg(true)
    setBgProgress({ method: 'transformers', progress: 0, status: 'Starting...' })
    setBgRemovalError(null)

    try {
      const result = await removeBackground(
        currentImageUrl,
        spec.backgroundColor,
        (progress) => setBgProgress(progress),
        preferredMethod
      )

      setCurrentImageUrl(result.dataUrl)
      setUsedMethod(result.method)
      setBgRemoved(true)
    } catch (error) {
      console.error('Background removal failed:', error)
      setBgRemovalError(error instanceof Error ? error.message : 'Background removal failed')
    } finally {
      setIsRemovingBg(false)
      setBgProgress(null)
    }
  }

  // Reset adjustments
  const handleResetAdjustments = () => {
    setBrightness(100)
    setContrast(100)
  }

  // Reset background removal
  const handleResetBackground = () => {
    setCurrentImageUrl(imageDataUrl)
    setBgRemoved(false)
    setUsedMethod(null)
    setBgRemovalError(null)
  }

  // Generate final image and continue
  const handleExport = () => {
    const preview = previewCanvasRef.current
    const ctx = preview?.getContext('2d')
    const img = imageRef.current

    if (!preview || !ctx || !img) return

    // Set to output dimensions
    preview.width = spec.digitalWidth
    preview.height = spec.digitalHeight

    // Scale factors
    const scaleFactorX = spec.digitalWidth / canvasWidth
    const scaleFactorY = spec.digitalHeight / canvasHeight

    // Fill background
    ctx.fillStyle = spec.backgroundColor
    ctx.fillRect(0, 0, spec.digitalWidth, spec.digitalHeight)

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`

    // Draw image at output scale
    ctx.drawImage(
      img,
      offsetX * scaleFactorX,
      offsetY * scaleFactorY,
      img.width * scale * scaleFactorX,
      img.height * scale * scaleFactorY
    )

    const dataUrl = preview.toDataURL('image/jpeg', 0.95)
    onProcessedImage(dataUrl)
  }

  return (
    <div className="space-y-6">
      {/* Face Detection Warning */}
      {faceDetection && !faceDetection.isValid && (
        <div className={cn(
          "p-4 rounded-lg flex items-start gap-3",
          faceDetection.faceCount === 0 ? "bg-destructive/10 border border-destructive/20" : "bg-warning/10 border border-warning/20"
        )}>
          {faceDetection.faceCount === 0 ? (
            <UserX className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          ) : (
            <Users className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={cn(
              "text-sm font-medium",
              faceDetection.faceCount === 0 ? "text-destructive" : "text-warning"
            )}>
              {faceDetection.faceCount === 0 ? "No Face Detected" : "Multiple People Detected"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {faceDetection.message}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {faceDetection.faceCount === 0
                ? "Please upload a clear selfie or portrait photo where your face is visible."
                : "Please upload a photo with just yourself - no other people in the frame."}
            </p>
          </div>
        </div>
      )}

      {isDetectingFace && (
        <div className="p-4 bg-accent/50 rounded-lg flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Analyzing photo...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <div className="tool-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-foreground">Position Your Photo</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {spec.flag} {spec.name} • {spec.width}x{spec.height}mm
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleZoom(0.8)}
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-14 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleZoom(1.25)}
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div
              ref={containerRef}
              className={cn(
                "relative mx-auto rounded-lg overflow-hidden border-2 border-border",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
              style={{ width: canvasWidth, height: canvasHeight }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="block"
              />
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Drag to move • Scroll or use buttons to zoom
            </p>

            <canvas ref={previewCanvasRef} className="hidden" />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Background Removal */}
          <div className="tool-card">
            <h3 className="font-medium text-foreground mb-4">Background</h3>

            {isRemovingBg ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{bgProgress?.status || 'Processing...'}</span>
                </div>
                <Progress value={bgProgress?.progress || 0} />
                <p className="text-xs text-muted-foreground">
                  Using {bgProgress?.method === 'transformers' ? 'AI Model (Transformers.js)' : 'IMGLY'} •
                  Processing in your browser
                </p>
              </div>
            ) : bgRemovalError ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-xs text-muted-foreground">{bgRemovalError}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => handleRemoveBackground('transformers')} variant="outline" size="sm">
                    Try Transformers
                  </Button>
                  <Button onClick={() => handleRemoveBackground('imgly')} variant="outline" size="sm">
                    Try IMGLY
                  </Button>
                </div>
              </div>
            ) : bgRemoved ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                  <Check className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Background Removed</p>
                    <p className="text-xs text-muted-foreground">
                      Using {usedMethod === 'transformers' ? 'AI Model' : 'IMGLY'}
                    </p>
                  </div>
                </div>
                <Button onClick={handleResetBackground} variant="outline" className="w-full" size="sm">
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Reset Background
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => handleRemoveBackground()}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4" />
                  Remove Background
                </Button>
                <p className="text-xs text-muted-foreground">
                  AI removes the background and makes it {spec.backgroundColorName.toLowerCase()}.
                  Uses two methods with automatic fallback.
                </p>
              </div>
            )}
          </div>

          {/* Adjustments */}
          <div className="tool-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Adjustments</h3>
              <Button variant="ghost" size="sm" onClick={handleResetAdjustments}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Brightness
                  </Label>
                  <span className="text-sm text-muted-foreground">{brightness}%</span>
                </div>
                <Slider
                  value={[brightness]}
                  onValueChange={([v]) => setBrightness(v)}
                  min={50}
                  max={150}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Contrast className="w-4 h-4" />
                    Contrast
                  </Label>
                  <span className="text-sm text-muted-foreground">{contrast}%</span>
                </div>
                <Slider
                  value={[contrast]}
                  onValueChange={([v]) => setContrast(v)}
                  min={50}
                  max={150}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={handleExport} className="w-full" size="lg">
              <Download className="w-4 h-4" />
              Continue to Print Layout
            </Button>
            <Button onClick={onReset} variant="outline" className="w-full">
              <X className="w-4 h-4" />
              Start Over
            </Button>
          </div>
        </div>
      </div>

      {/* Tip */}
      {!bgRemoved && (
        <div className="p-4 bg-accent/50 rounded-lg flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Tip: Remove Background First
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Most passport photos require a plain {spec.backgroundColorName.toLowerCase()} background.
              Our AI will try two different methods to ensure the best result.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
