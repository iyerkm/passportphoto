import { useState, useRef, useEffect } from 'react'
import { Download, Printer, ArrowLeft, Grid3X3, Coffee, Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  PRINT_SIZES,
  calculatePhotoGrid,
  type PrintSize,
  type PassportSpec,
} from '@/lib/passport-specs'
import { cn } from '@/lib/utils'

interface PrintLayoutProps {
  imageDataUrl: string
  spec: PassportSpec
  onBack: () => void
  onReset: () => void
}

const BUY_ME_COFFEE_URL = 'https://buymeacoffee.com/andachai'

export function PrintLayout({ imageDataUrl, spec, onBack, onReset }: PrintLayoutProps) {
  const printCanvasRef = useRef<HTMLCanvasElement>(null)
  const singlePhotoRef = useRef<HTMLCanvasElement>(null)
  const [printSize, setPrintSize] = useState<PrintSize>('4x6')
  const [photoCount, setPhotoCount] = useState(6)
  const [showPrintLayout, setShowPrintLayout] = useState(false)
  const [coffeeClicked, setCoffeeClicked] = useState(false)

  const grid = calculatePhotoGrid(printSize, spec)
  const maxPhotos = grid.total

  // Generate single photo canvas
  useEffect(() => {
    const canvas = singlePhotoRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = spec.digitalWidth
      canvas.height = spec.digitalHeight
      ctx.drawImage(img, 0, 0, spec.digitalWidth, spec.digitalHeight)
    }
    img.src = imageDataUrl
  }, [imageDataUrl, spec])

  // Download single photo
  const handleDownloadSingle = () => {
    const link = document.createElement('a')
    link.download = `passport-photo-${spec.country.toLowerCase().replace(/\s+/g, '-')}.jpg`
    link.href = imageDataUrl
    link.click()
  }

  // Handle coffee link click
  const handleCoffeeClick = () => {
    setCoffeeClicked(true)
    window.open(BUY_ME_COFFEE_URL, '_blank')
  }

  // Unlock print layout
  const handleUnlockPrint = () => {
    setShowPrintLayout(true)
  }

  // Ensure photo count doesn't exceed max
  useEffect(() => {
    if (photoCount > maxPhotos) {
      setPhotoCount(Math.min(6, maxPhotos))
    }
  }, [maxPhotos, photoCount])

  // Generate print layout
  useEffect(() => {
    const canvas = printCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const print = PRINT_SIZES[printSize]
    // Convert mm to pixels at 300 DPI
    const dpi = 300
    const mmToPixel = (mm: number) => Math.round((mm / 25.4) * dpi)

    const canvasWidth = mmToPixel(print.width)
    const canvasHeight = mmToPixel(print.height)

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Fill with white
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Load and draw photos
    const img = new Image()
    img.onload = () => {
      const photoWidth = mmToPixel(spec.width)
      const photoHeight = mmToPixel(spec.height)
      const gap = mmToPixel(3)

      // Calculate grid layout
      const cols = Math.min(grid.cols, Math.ceil(Math.sqrt(photoCount)))
      const rows = Math.ceil(photoCount / cols)

      // Center the grid
      const totalWidth = cols * photoWidth + (cols - 1) * gap
      const totalHeight = rows * photoHeight + (rows - 1) * gap
      const startX = (canvasWidth - totalWidth) / 2
      const startY = (canvasHeight - totalHeight) / 2

      let count = 0
      for (let row = 0; row < rows && count < photoCount; row++) {
        for (let col = 0; col < cols && count < photoCount; col++) {
          const x = startX + col * (photoWidth + gap)
          const y = startY + row * (photoHeight + gap)

          // Draw photo border (light gray)
          ctx.strokeStyle = '#E0E0E0'
          ctx.lineWidth = 1
          ctx.strokeRect(x - 1, y - 1, photoWidth + 2, photoHeight + 2)

          // Draw photo
          ctx.drawImage(img, x, y, photoWidth, photoHeight)
          count++
        }
      }

      // Add cut guides (dashed lines around each photo)
      ctx.strokeStyle = '#CCCCCC'
      ctx.lineWidth = 0.5
      ctx.setLineDash([mmToPixel(2), mmToPixel(2)])

      count = 0
      for (let row = 0; row < rows && count < photoCount; row++) {
        for (let col = 0; col < cols && count < photoCount; col++) {
          const x = startX + col * (photoWidth + gap)
          const y = startY + row * (photoHeight + gap)
          ctx.strokeRect(x, y, photoWidth, photoHeight)
          count++
        }
      }
    }
    img.src = imageDataUrl
  }, [imageDataUrl, printSize, photoCount, spec, grid])

  // Download print layout
  const handleDownload = () => {
    const canvas = printCanvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `passport-photos-${spec.country.toLowerCase().replace(/\s+/g, '-')}-${printSize}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.95)
    link.click()
  }

  // Print directly
  const handlePrint = () => {
    const canvas = printCanvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Passport Photos</title>
            <style>
              @page { size: ${PRINT_SIZES[printSize].name}; margin: 0; }
              body { margin: 0; display: flex; justify-content: center; align-items: center; }
              img { max-width: 100%; max-height: 100vh; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  // Preview scale (to fit on screen)
  const print = PRINT_SIZES[printSize]
  const previewScale = Math.min(500 / print.width, 700 / print.height)
  const previewWidth = print.width * previewScale
  const previewHeight = print.height * previewScale

  return (
    <div className="space-y-6">
      {/* Single Photo Download Section */}
      <div className="tool-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-foreground">Your Passport Photo</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {spec.flag} {spec.name} • {spec.digitalWidth}x{spec.digitalHeight}px
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Photo Preview */}
          <div className="flex-shrink-0">
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden border border-border"
              style={{ width: 200, height: 200 * (spec.height / spec.width) }}
            >
              <img
                src={imageDataUrl}
                alt="Passport photo"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {spec.width}x{spec.height}mm • {spec.fileSizeMinKB}-{spec.fileSizeMaxKB}KB
            </p>
          </div>

          {/* Download Action */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Download Individual Photo</h4>
              <p className="text-sm text-muted-foreground">
                Download your photo and print it yourself, or upload it to government portals.
              </p>
            </div>
            <Button onClick={handleDownloadSingle} className="w-full md:w-auto" size="lg">
              <Download className="w-4 h-4" />
              Download Photo
            </Button>
          </div>
        </div>

        <canvas ref={singlePhotoRef} className="hidden" />
      </div>

      {/* Coffee / Print Layout Section */}
      {!showPrintLayout ? (
        <div className="tool-card border-2 border-dashed border-primary/30 bg-accent/30">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Coffee className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground mb-1">Want a 4x6 Print Layout?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get multiple photos on a single sheet for easy printing. If this tool saved you a trip to the photo studio, consider buying me a coffee!
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleCoffeeClick} variant="default" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Buy Me a Coffee
                </Button>
                <Button onClick={handleUnlockPrint} variant="outline" className="gap-2">
                  {coffeeClicked ? 'Continue to Print Layout' : 'Skip & Continue'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
              {coffeeClicked && (
                <p className="text-xs text-success mt-3 flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Thank you for your support!
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Collapsible Print Layout Header */}
          <button
            onClick={() => setShowPrintLayout(!showPrintLayout)}
            className="w-full tool-card flex items-center justify-between hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Grid3X3 className="w-5 h-5 text-primary" />
              <div className="text-left">
                <h3 className="font-medium text-foreground">Print Layout</h3>
                <p className="text-xs text-muted-foreground">
                  Multiple photos on one sheet
                </p>
              </div>
            </div>
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview */}
            <div className="lg:col-span-2">
              <div className="tool-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-foreground">Print Preview</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {spec.flag} {spec.name} • {spec.width}x{spec.height}mm
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {photoCount} photos on {PRINT_SIZES[printSize].name}
                  </span>
                </div>

                <div
                  className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
                  style={{ width: previewWidth, height: previewHeight }}
                >
                  <canvas
                    ref={printCanvasRef}
                    className="w-full h-full"
                  />
                </div>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Print at 300 DPI for best quality
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Print Size */}
              <div className="tool-card">
                <Label className="text-foreground mb-3 block">Paper Size</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PRINT_SIZES) as PrintSize[]).map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        setPrintSize(size)
                        const newGrid = calculatePhotoGrid(size, spec)
                        if (photoCount > newGrid.total) {
                          setPhotoCount(newGrid.total)
                        }
                      }}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-colors",
                        printSize === size
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="text-sm font-medium">{PRINT_SIZES[size].name}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(PRINT_SIZES[size].width)}x{Math.round(PRINT_SIZES[size].height)}mm
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Count */}
              <div className="tool-card">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-foreground">Number of Photos</Label>
                  <span className="text-sm text-muted-foreground">Max: {maxPhotos}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPhotoCount(Math.max(1, photoCount - 1))}
                    disabled={photoCount <= 1}
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-semibold">{photoCount}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPhotoCount(Math.min(maxPhotos, photoCount + 1))}
                    disabled={photoCount >= maxPhotos}
                  >
                    +
                  </Button>
                </div>
                <div className="flex justify-center gap-2 mt-3">
                  {[2, 4, 6, 8].filter(n => n <= maxPhotos).map(n => (
                    <Button
                      key={n}
                      variant={photoCount === n ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPhotoCount(n)}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button onClick={handleDownload} className="w-full" size="lg">
                  <Download className="w-4 h-4" />
                  Download Print File
                </Button>
                <Button onClick={handlePrint} variant="outline" className="w-full">
                  <Printer className="w-4 h-4" />
                  Print Directly
                </Button>
              </div>
            </div>
          </div>

          {/* Printing Tips */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Printing Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Print on matte or glossy photo paper for best results</li>
              <li>Select "Actual Size" or "100%" in your print settings</li>
              <li>Disable any "Fit to Page" options to maintain correct dimensions</li>
              <li>Cut along the light gray guide lines</li>
            </ul>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex gap-2">
        <Button onClick={onBack} variant="ghost" className="flex-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Editor
        </Button>
        <Button onClick={onReset} variant="ghost" className="flex-1">
          <Grid3X3 className="w-4 h-4" />
          New Photo
        </Button>
      </div>
    </div>
  )
}
