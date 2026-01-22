import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  onImageSelect: (file: File, dataUrl: string) => void
  className?: string
}

export function PhotoUpload({ onImageSelect, className }: PhotoUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        onImageSelect(file, reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageSelect])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "drop-zone flex flex-col items-center justify-center min-h-[300px] text-center",
          isDragActive && "active"
        )}
      >
        <input {...getInputProps()} />

        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
          {isDragActive ? (
            <ImageIcon className="w-8 h-8 text-primary" />
          ) : (
            <Upload className="w-8 h-8 text-primary" />
          )}
        </div>

        {isDragActive ? (
          <p className="text-lg font-medium text-foreground">Drop your photo here</p>
        ) : (
          <>
            <p className="text-lg font-medium text-foreground mb-2">
              Drag & drop your photo here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, JPEG, PNG (max 10MB)
            </p>
          </>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-destructive/10 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">File rejected</p>
            <p className="text-sm text-muted-foreground">
              {fileRejections[0].errors[0].message}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Photo Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>Use a recent photo taken against a plain white background</li>
          <li>Ensure your face is clearly visible with even lighting</li>
          <li>Avoid wearing glasses or head coverings (unless religious)</li>
          <li>Keep a neutral expression with mouth closed</li>
        </ul>
      </div>
    </div>
  )
}
