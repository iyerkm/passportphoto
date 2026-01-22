import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { PhotoUpload } from '@/components/passport/PhotoUpload'
import { PhotoEditor } from '@/components/passport/PhotoEditor'
import { PrintLayout } from '@/components/passport/PrintLayout'
import { PassportSpecs } from '@/components/passport/PassportSpecs'
import { CountrySelector } from '@/components/passport/CountrySelector'
import { Camera, Moon, Sun, Coffee, Github, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PASSPORT_SPECS, type PassportSpec } from '@/lib/passport-specs'
import './index.css'

type AppStep = 'upload' | 'edit' | 'print'

// Initialize theme from localStorage
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark')
  }
}

function App() {
  const [step, setStep] = useState<AppStep>('upload')
  const [selectedSpec, setSelectedSpec] = useState<PassportSpec>(PASSPORT_SPECS[0])
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  const toggleDarkMode = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  const handleImageSelect = (_file: File, dataUrl: string) => {
    setOriginalImage(dataUrl)
    setStep('edit')
  }

  const handleProcessedImage = (dataUrl: string) => {
    setProcessedImage(dataUrl)
    setStep('print')
  }

  const handleReset = () => {
    setOriginalImage(null)
    setProcessedImage(null)
    setStep('upload')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-foreground">Passport Photo Maker</h1>
                <p className="text-xs text-muted-foreground">Free online passport photo tool</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="h-9 w-9"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <a
                href="https://buymeacoffee.com/andachai"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors"
              >
                <Coffee className="w-4 h-4" />
                Buy me a coffee
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {[
              { id: 'upload', label: 'Upload', num: 1 },
              { id: 'edit', label: 'Edit', num: 2 },
              { id: 'print', label: 'Print', num: 3 },
            ].map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${step === s.id
                      ? 'bg-primary text-primary-foreground'
                      : s.num < ({ upload: 1, edit: 2, print: 3 }[step] || 1)
                        ? 'bg-success/20 text-success'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                    {s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < 2 && (
                  <div className={`
                    w-8 sm:w-12 h-0.5 mx-1 sm:mx-2
                    ${s.num < ({ upload: 1, edit: 2, print: 3 }[step] || 1)
                      ? 'bg-success'
                      : 'bg-border'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {step === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Country Selector */}
              <div className="tool-card">
                <h2 className="text-sm font-medium text-foreground mb-3">Select Country & Document Type</h2>
                <CountrySelector
                  selectedSpec={selectedSpec}
                  onSelectSpec={setSelectedSpec}
                />
              </div>

              {/* Upload Area */}
              <div className="tool-card">
                <h2 className="text-lg font-semibold text-foreground mb-4">Upload Your Photo</h2>
                <PhotoUpload onImageSelect={handleImageSelect} />
              </div>
            </div>
            <div>
              <div className="tool-card sticky top-6">
                <PassportSpecs spec={selectedSpec} />
              </div>
            </div>
          </div>
        )}

        {step === 'edit' && originalImage && (
          <PhotoEditor
            imageDataUrl={originalImage}
            spec={selectedSpec}
            onProcessedImage={handleProcessedImage}
            onReset={handleReset}
          />
        )}

        {step === 'print' && processedImage && (
          <PrintLayout
            imageDataUrl={processedImage}
            spec={selectedSpec}
            onBack={() => setStep('edit')}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>All processing happens in your browser. Your photos never leave your device.</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://buymeacoffee.com/andachai"
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors"
              >
                <Coffee className="w-4 h-4" />
                Support
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Supporting 15+ countries including USA, UK, India, Canada, Australia, and more.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
