// Background Removal Service
// Uses multiple methods with automatic fallback

export type RemovalMethod = 'transformers' | 'imgly'

export interface RemovalProgress {
  method: RemovalMethod
  progress: number
  status: string
}

export type ProgressCallback = (progress: RemovalProgress) => void

/**
 * Add a solid background color to a transparent image
 */
function addBackgroundColor(
  transparentImageUrl: string,
  backgroundColor: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!

      // Fill with background color first
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw the transparent image on top
      ctx.drawImage(img, 0, 0)

      // Export as PNG to preserve quality
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load image for background fill'))
    img.src = transparentImageUrl
  })
}

/**
 * Remove background using Hugging Face Transformers.js
 * Uses the RMBG-1.4 model which is optimized for portraits
 */
async function removeBackgroundTransformers(
  imageBlob: Blob,
  onProgress: ProgressCallback
): Promise<Blob> {
  onProgress({ method: 'transformers', progress: 0, status: 'Loading AI model...' })

  // Dynamic import to reduce initial bundle size
  const { pipeline, env, RawImage } = await import('@huggingface/transformers')

  // Configure environment
  env.allowLocalModels = false
  env.useBrowserCache = true

  onProgress({ method: 'transformers', progress: 10, status: 'Initializing pipeline...' })

  // Create the background removal pipeline
  const segmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
    progress_callback: (progress: { progress?: number; status?: string }) => {
      if (progress.progress !== undefined) {
        onProgress({
          method: 'transformers',
          progress: 10 + Math.round(progress.progress * 0.4),
          status: progress.status || 'Loading model...'
        })
      }
    }
  })

  onProgress({ method: 'transformers', progress: 50, status: 'Processing image...' })

  // Convert blob to data URL for processing
  const imageUrl = URL.createObjectURL(imageBlob)

  try {
    // Load image
    const image = await RawImage.fromURL(imageUrl)

    // Run segmentation
    const output = await segmenter(image)

    onProgress({ method: 'transformers', progress: 80, status: 'Generating output...' })

    // Get the mask from the output
    if (Array.isArray(output) && output.length > 0) {
      const maskData = output[0]

      // If we have a mask blob directly
      if (maskData.mask) {
        // Create canvas with original image
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const ctx = canvas.getContext('2d')!

        // Draw original image
        const originalImg = new Image()
        await new Promise<void>((resolve) => {
          originalImg.onload = () => resolve()
          originalImg.src = imageUrl
        })
        ctx.drawImage(originalImg, 0, 0)

        // Get the mask as image data
        const maskBlob = await maskData.mask.toBlob()
        const maskUrl = URL.createObjectURL(maskBlob)
        const maskImg = new Image()
        await new Promise<void>((resolve) => {
          maskImg.onload = () => resolve()
          maskImg.src = maskUrl
        })

        // Apply mask
        ctx.globalCompositeOperation = 'destination-in'
        ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height)

        URL.revokeObjectURL(maskUrl)

        onProgress({ method: 'transformers', progress: 100, status: 'Complete!' })

        return new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create output blob'))
          }, 'image/png')
        })
      }
    }

    throw new Error('No segmentation result returned')
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

/**
 * Remove background using @imgly/background-removal
 * Uses a different model, good as fallback
 */
async function removeBackgroundImgly(
  imageBlob: Blob,
  onProgress: ProgressCallback
): Promise<Blob> {
  onProgress({ method: 'imgly', progress: 0, status: 'Loading background removal...' })

  const { removeBackground } = await import('@imgly/background-removal')

  onProgress({ method: 'imgly', progress: 10, status: 'Processing image...' })

  const result = await removeBackground(imageBlob, {
    progress: (_key: string, current: number, total: number) => {
      const progress = 10 + Math.round((current / total) * 90)
      onProgress({
        method: 'imgly',
        progress,
        status: progress < 50 ? 'Loading model...' : 'Removing background...'
      })
    },
    output: {
      format: 'image/png',
    },
  })

  onProgress({ method: 'imgly', progress: 100, status: 'Complete!' })
  return result
}

/**
 * Main background removal function
 * Tries both methods with automatic fallback
 * Returns image with solid background color applied
 */
export async function removeBackground(
  imageDataUrl: string,
  backgroundColor: string,
  onProgress: ProgressCallback,
  preferredMethod?: RemovalMethod
): Promise<{ dataUrl: string; method: RemovalMethod }> {
  // Convert data URL to blob
  const response = await fetch(imageDataUrl)
  const blob = await response.blob()

  const methods: RemovalMethod[] = preferredMethod
    ? [preferredMethod, preferredMethod === 'transformers' ? 'imgly' : 'transformers']
    : ['imgly', 'transformers'] // Start with imgly as it's more reliable

  let lastError: Error | null = null

  for (const method of methods) {
    try {
      console.log(`Trying background removal with: ${method}`)

      let resultBlob: Blob

      if (method === 'transformers') {
        resultBlob = await removeBackgroundTransformers(blob, onProgress)
      } else {
        resultBlob = await removeBackgroundImgly(blob, onProgress)
      }

      // Convert blob to data URL
      const transparentDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result)
          } else {
            reject(new Error('Failed to read result'))
          }
        }
        reader.onerror = () => reject(new Error('Failed to read result'))
        reader.readAsDataURL(resultBlob)
      })

      // Add the background color to the transparent image
      onProgress({ method, progress: 95, status: 'Adding background color...' })
      const finalDataUrl = await addBackgroundColor(transparentDataUrl, backgroundColor)

      onProgress({ method, progress: 100, status: 'Complete!' })

      return { dataUrl: finalDataUrl, method }
    } catch (error) {
      console.error(`Background removal with ${method} failed:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))

      // If this wasn't the last method, notify that we're trying fallback
      if (method !== methods[methods.length - 1]) {
        onProgress({
          method: methods[1],
          progress: 0,
          status: `${method} failed, trying ${methods[1]}...`
        })
      }
    }
  }

  throw lastError || new Error('All background removal methods failed')
}
