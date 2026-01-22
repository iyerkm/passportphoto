// Face Detection for Photo Validation
// Uses TensorFlow.js Face Detection model

export interface FaceDetectionResult {
  faceCount: number
  isValid: boolean
  message: string
  faces: Array<{
    box: { x: number; y: number; width: number; height: number }
    confidence: number
  }>
}

/**
 * Detect faces in an image using TensorFlow.js
 */
export async function detectFaces(imageDataUrl: string): Promise<FaceDetectionResult> {
  try {
    // Dynamic import to reduce bundle size
    const tf = await import('@tensorflow/tfjs')
    const faceDetection = await import('@tensorflow-models/face-landmarks-detection')

    // Load the face detection model
    const model = await faceDetection.createDetector(
      faceDetection.SupportedModels.MediaPipeFaceMesh,
      {
        runtime: 'tfjs',
        refineLandmarks: false,
        maxFaces: 5, // Detect up to 5 faces to check for multiple people
      }
    )

    // Load image
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageDataUrl
    })

    // Create a canvas to get image data
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    // Detect faces
    const faces = await model.estimateFaces(canvas, {
      flipHorizontal: false,
    })

    // Clean up
    model.dispose()

    const faceCount = faces.length

    if (faceCount === 0) {
      return {
        faceCount: 0,
        isValid: false,
        message: 'No face detected. Please upload a clear photo of your face.',
        faces: [],
      }
    }

    if (faceCount > 1) {
      return {
        faceCount,
        isValid: false,
        message: `${faceCount} faces detected. Passport photos must contain only one person. Please upload a photo with just yourself.`,
        faces: faces.map(face => ({
          box: face.box as { x: number; y: number; width: number; height: number },
          confidence: 1, // MediaPipe doesn't provide confidence scores
        })),
      }
    }

    // Single face detected - valid
    const face = faces[0]
    return {
      faceCount: 1,
      isValid: true,
      message: 'Face detected successfully.',
      faces: [{
        box: face.box as { x: number; y: number; width: number; height: number },
        confidence: 1,
      }],
    }
  } catch (error) {
    console.error('Face detection failed:', error)
    // If face detection fails, we'll allow the photo but warn
    return {
      faceCount: -1,
      isValid: true, // Allow to proceed even if detection fails
      message: 'Could not verify face. Please ensure your photo shows a clear front-facing view.',
      faces: [],
    }
  }
}

/**
 * Simple face detection using canvas-based skin color detection
 * This is a fallback if TensorFlow.js fails
 */
export async function simpleFaceCheck(imageDataUrl: string): Promise<{
  hasFace: boolean
  message: string
}> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 100 // Sample at smaller size for performance
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!

      // Draw image scaled down
      ctx.drawImage(img, 0, 0, size, size)

      // Get image data
      const imageData = ctx.getImageData(0, 0, size, size)
      const data = imageData.data

      // Count skin-colored pixels (very rough heuristic)
      let skinPixels = 0
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Simple skin color detection (works for various skin tones)
        if (
          r > 95 && g > 40 && b > 20 &&
          Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
          Math.abs(r - g) > 15 &&
          r > g && r > b
        ) {
          skinPixels++
        }
      }

      const skinRatio = skinPixels / (size * size)

      // If at least 5% of the image has skin colors, likely has a face
      if (skinRatio > 0.05) {
        resolve({
          hasFace: true,
          message: 'Photo appears to contain a face.',
        })
      } else {
        resolve({
          hasFace: false,
          message: 'Could not detect a face in this photo. Please upload a clear portrait photo.',
        })
      }
    }
    img.onerror = () => {
      resolve({
        hasFace: false,
        message: 'Failed to load image.',
      })
    }
    img.src = imageDataUrl
  })
}
