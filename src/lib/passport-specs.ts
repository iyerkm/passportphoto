// Passport Photo Specifications for Multiple Countries
// Based on official guidelines from respective government agencies

export interface PassportSpec {
  id: string
  country: string
  flag: string
  name: string
  // Photo dimensions in mm
  width: number
  height: number
  // Face area requirements (percentage of photo height)
  faceMinPercent: number
  faceMaxPercent: number
  // Digital requirements (pixels)
  digitalWidth: number
  digitalHeight: number
  // File size limits (in KB)
  fileSizeMinKB: number
  fileSizeMaxKB: number
  // Background color (hex)
  backgroundColor: string
  backgroundColorName: string
  // Official requirements URL
  officialUrl: string
  // Additional requirements
  requirements: string[]
}

export const PASSPORT_SPECS: PassportSpec[] = [
  {
    id: 'india',
    country: 'India',
    flag: '🇮🇳',
    name: 'Indian Passport (Standard)',
    width: 35,
    height: 45,
    faceMinPercent: 70,
    faceMaxPercent: 85,
    digitalWidth: 630,
    digitalHeight: 810,
    fileSizeMinKB: 20,
    fileSizeMaxKB: 100,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White',
    officialUrl: '',
    requirements: [
      'Photo must be in color with natural skin tones',
      'Plain white or off-white background',
      'Front-facing with neutral expression',
      'Eyes open and clearly visible',
      'Mouth closed',
      'No glasses',
      'No head covering (except for religious reasons)',
      'Face must be clearly visible from chin to forehead',
      'No shadows on face or background',
      'Photo should be recent (taken within last 3 months)',
    ],
  },
  {
    id: 'india-2x2',
    country: 'India',
    flag: '🇮🇳',
    name: 'Indian Passport (2x2 inch)',
    width: 51,
    height: 51,
    faceMinPercent: 70,
    faceMaxPercent: 80,
    digitalWidth: 600,
    digitalHeight: 600,
    fileSizeMinKB: 20,
    fileSizeMaxKB: 100,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White',
    officialUrl: '',
    requirements: [
      'Photo must be in color with natural skin tones',
      'Plain white or off-white background',
      'Front-facing with neutral expression',
      'Eyes open and clearly visible',
      'Mouth closed',
      'No glasses',
      'No head covering (except for religious reasons)',
      'Face centered in the frame',
    ],
  },
  {
    id: 'usa',
    country: 'United States',
    flag: '🇺🇸',
    name: 'US Passport',
    width: 51,
    height: 51,
    faceMinPercent: 50,
    faceMaxPercent: 69,
    digitalWidth: 600,
    digitalHeight: 600,
    fileSizeMinKB: 54,
    fileSizeMaxKB: 240,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White',
    officialUrl: 'https://travel.state.gov/content/travel/en/passports/how-apply/photos.html',
    requirements: [
      'Photo must be in color',
      'Plain white or off-white background',
      'Taken within the last 6 months',
      'Full face, front view with eyes open',
      'Neutral facial expression or natural smile',
      'Head must be between 1 inch and 1 3/8 inches (25mm - 35mm)',
      'No glasses',
      'No head coverings (except for religious reasons)',
      'No uniforms (except religious attire)',
    ],
  },
  {
    id: 'uk',
    country: 'United Kingdom',
    flag: '🇬🇧',
    name: 'UK Passport',
    width: 35,
    height: 45,
    faceMinPercent: 70,
    faceMaxPercent: 80,
    digitalWidth: 600,
    digitalHeight: 750,
    fileSizeMinKB: 50,
    fileSizeMaxKB: 10000,
    backgroundColor: '#F5F5F5',
    backgroundColorName: 'Light Grey',
    officialUrl: 'https://www.gov.uk/photos-for-passports',
    requirements: [
      'Plain light grey or cream background',
      'No other objects or people in photo',
      'Clear quality with no red-eye',
      'Facing forward looking straight at camera',
      'Mouth closed, no smiling',
      'Eyes open and visible',
      'No glasses',
      'Nothing covering your face',
      'No shadows on face or behind you',
    ],
  },
  {
    id: 'canada',
    country: 'Canada',
    flag: '🇨🇦',
    name: 'Canadian Passport',
    width: 50,
    height: 70,
    faceMinPercent: 45,
    faceMaxPercent: 55,
    digitalWidth: 420,
    digitalHeight: 540,
    fileSizeMinKB: 60,
    fileSizeMaxKB: 240,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White',
    officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html',
    requirements: [
      'Plain white or light-coloured background',
      'Taken within the last 12 months',
      'Clear, sharp focus',
      'Front view of face and shoulders',
      'Neutral expression, mouth closed',
      'Eyes open and clearly visible',
      'Face centered and showing full head',
      'No glasses',
      'No head coverings (except religious)',
    ],
  },
  {
    id: 'australia',
    country: 'Australia',
    flag: '🇦🇺',
    name: 'Australian Passport',
    width: 35,
    height: 45,
    faceMinPercent: 64,
    faceMaxPercent: 80,
    digitalWidth: 600,
    digitalHeight: 800,
    fileSizeMinKB: 70,
    fileSizeMaxKB: 3500,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White',
    officialUrl: 'https://www.passports.gov.au/help/passport-photos',
    requirements: [
      'Plain light-coloured background',
      'Taken within the last 6 months',
      'In focus with no ink marks or creases',
      'Face directly facing camera',
      'Neutral expression with mouth closed',
      'Eyes open and clearly visible',
      'No glasses',
      'Head coverings only for religious reasons',
      'Photo shows head and shoulders only',
    ],
  },
  {
    id: 'schengen',
    country: 'Schengen/EU',
    flag: '🇪🇺',
    name: 'Schengen Visa / EU',
    width: 35,
    height: 45,
    faceMinPercent: 70,
    faceMaxPercent: 80,
    digitalWidth: 600,
    digitalHeight: 800,
    fileSizeMinKB: 50,
    fileSizeMaxKB: 500,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White or Light Grey',
    officialUrl: 'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy_en',
    requirements: [
      'Taken within the last 6 months',
      'Clear quality, in focus',
      'Light background (white, cream or light grey)',
      'Face takes up 70-80% of the photograph',
      'Looking straight at camera',
      'Neutral expression with mouth closed',
      'Eyes clearly visible, no glasses',
      'No head coverings (except religious)',
      'No shadows on face or background',
    ],
  },
  {
    id: 'china',
    country: 'China',
    flag: '🇨🇳',
    name: 'Chinese Passport',
    width: 33,
    height: 48,
    faceMinPercent: 58,
    faceMaxPercent: 75,
    digitalWidth: 390,
    digitalHeight: 567,
    fileSizeMinKB: 40,
    fileSizeMaxKB: 120,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White',
    officialUrl: 'https://www.visaforchina.cn/',
    requirements: [
      'Plain white background',
      'Taken within the last 6 months',
      'Color photograph',
      'Front view with neutral expression',
      'Both ears visible',
      'Eyes open and looking at camera',
      'No glasses',
      'No hats or head coverings',
      'Face centered in frame',
    ],
  },
  {
    id: 'japan',
    country: 'Japan',
    flag: '🇯🇵',
    name: 'Japanese Passport',
    width: 35,
    height: 45,
    faceMinPercent: 70,
    faceMaxPercent: 80,
    digitalWidth: 600,
    digitalHeight: 800,
    fileSizeMinKB: 50,
    fileSizeMaxKB: 500,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White or Light Blue',
    officialUrl: 'https://www.mofa.go.jp/mofaj/toko/passport/',
    requirements: [
      'Plain white, light blue, or light grey background',
      'Taken within the last 6 months',
      'No border around photo',
      'Face directly facing camera',
      'Neutral expression',
      'Eyes open and clearly visible',
      'No glasses',
      'No hats or hair accessories covering face',
      'Clear and in focus',
    ],
  },
  {
    id: 'germany',
    country: 'Germany',
    flag: '🇩🇪',
    name: 'German Passport',
    width: 35,
    height: 45,
    faceMinPercent: 70,
    faceMaxPercent: 80,
    digitalWidth: 600,
    digitalHeight: 800,
    fileSizeMinKB: 50,
    fileSizeMaxKB: 500,
    backgroundColor: '#E8E8E8',
    backgroundColorName: 'Light Grey',
    officialUrl: 'https://www.bmi.bund.de/EN/topics/modern-administration/identity-documents/passport/passport-node.html',
    requirements: [
      'Plain light grey background (no patterns)',
      'Taken within the last 6 months',
      'High quality print on photo paper',
      'Face centered, looking directly at camera',
      'Neutral expression with closed mouth',
      'Eyes open and fully visible',
      'No glasses',
      'No head coverings (except religious)',
      'Face must be evenly lit with no shadows',
    ],
  },
  {
    id: 'france',
    country: 'France',
    flag: '🇫🇷',
    name: 'French Passport',
    width: 35,
    height: 45,
    faceMinPercent: 70,
    faceMaxPercent: 80,
    digitalWidth: 600,
    digitalHeight: 800,
    fileSizeMinKB: 50,
    fileSizeMaxKB: 500,
    backgroundColor: '#E0E0E0',
    backgroundColorName: 'Light Grey or Blue',
    officialUrl: 'https://www.service-public.fr/particuliers/vosdroits/F10619',
    requirements: [
      'Light grey or light blue background',
      'Recent photograph',
      'Sharp focus, no scratches',
      'Face straight and centered',
      'Neutral expression',
      'Mouth closed',
      'Eyes clearly visible and open',
      'No glasses',
      'No head covering (except religious)',
    ],
  },
  {
    id: 'uae',
    country: 'UAE',
    flag: '🇦🇪',
    name: 'UAE Passport / Visa',
    width: 43,
    height: 55,
    faceMinPercent: 70,
    faceMaxPercent: 80,
    digitalWidth: 600,
    digitalHeight: 800,
    fileSizeMinKB: 40,
    fileSizeMaxKB: 200,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White',
    officialUrl: 'https://icp.gov.ae/',
    requirements: [
      'Plain white background',
      'Taken within the last 6 months',
      'Color photograph',
      'Front view with neutral expression',
      'Eyes open and clearly visible',
      'No glasses',
      'Women may wear hijab (face must be visible)',
      'No smiling',
      'High resolution and clear focus',
    ],
  },
  {
    id: 'saudi',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    name: 'Saudi Arabia Visa',
    width: 40,
    height: 60,
    faceMinPercent: 70,
    faceMaxPercent: 80,
    digitalWidth: 400,
    digitalHeight: 600,
    fileSizeMinKB: 40,
    fileSizeMaxKB: 200,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White',
    officialUrl: 'https://visa.mofa.gov.sa/',
    requirements: [
      'Plain white background',
      'Recent photograph',
      'Color photograph',
      'Face clearly visible',
      'Neutral expression',
      'Eyes open',
      'No glasses',
      'Women may wear hijab',
      'No head covering for men',
    ],
  },
  {
    id: 'singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    name: 'Singapore Passport',
    width: 35,
    height: 45,
    faceMinPercent: 70,
    faceMaxPercent: 80,
    digitalWidth: 400,
    digitalHeight: 514,
    fileSizeMinKB: 10,
    fileSizeMaxKB: 60,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White',
    officialUrl: 'https://www.ica.gov.sg/photo-guidelines',
    requirements: [
      'Plain white background',
      'Taken within the last 3 months',
      'Color photograph',
      'Full frontal view of face',
      'Neutral expression with mouth closed',
      'Eyes open and looking at camera',
      'No glasses',
      'No head coverings (except religious)',
      'Sharp focus, no shadows',
    ],
  },
  {
    id: 'malaysia',
    country: 'Malaysia',
    flag: '🇲🇾',
    name: 'Malaysian Passport',
    width: 35,
    height: 50,
    faceMinPercent: 70,
    faceMaxPercent: 80,
    digitalWidth: 600,
    digitalHeight: 800,
    fileSizeMinKB: 50,
    fileSizeMaxKB: 300,
    backgroundColor: '#FFFFFF',
    backgroundColorName: 'White',
    officialUrl: 'https://www.jpn.gov.my/',
    requirements: [
      'Plain white background',
      'Taken within the last 6 months',
      'Color photograph',
      'Face centered, looking straight',
      'Neutral expression',
      'Eyes open',
      'No glasses',
      'Head coverings allowed for religious reasons',
      'No shadows',
    ],
  },
]

// Get spec by ID
export function getSpecById(id: string): PassportSpec {
  return PASSPORT_SPECS.find(s => s.id === id) || PASSPORT_SPECS[0]
}

// Group specs by country for the dropdown
export function getSpecsByCountry(): Map<string, PassportSpec[]> {
  const map = new Map<string, PassportSpec[]>()
  for (const spec of PASSPORT_SPECS) {
    const existing = map.get(spec.country) || []
    existing.push(spec)
    map.set(spec.country, existing)
  }
  return map
}

// Print layout sizes (in mm)
export const PRINT_SIZES = {
  '4x6': { width: 101.6, height: 152.4, name: '4" x 6"' },
  '5x7': { width: 127, height: 177.8, name: '5" x 7"' },
  'A4': { width: 210, height: 297, name: 'A4' },
  'letter': { width: 215.9, height: 279.4, name: 'Letter' },
} as const

export type PrintSize = keyof typeof PRINT_SIZES

// Calculate how many photos fit on a print size
export function calculatePhotoGrid(printSize: PrintSize, photoSpec: PassportSpec, gapMm: number = 3): { cols: number; rows: number; total: number } {
  const print = PRINT_SIZES[printSize]
  const marginMm = 5
  const usableWidth = print.width - (marginMm * 2)
  const usableHeight = print.height - (marginMm * 2)

  const cols = Math.floor((usableWidth + gapMm) / (photoSpec.width + gapMm))
  const rows = Math.floor((usableHeight + gapMm) / (photoSpec.height + gapMm))

  return { cols, rows, total: cols * rows }
}

// Face detection guide box (relative to photo dimensions)
export function getFaceGuideBox(photoWidth: number, photoHeight: number, spec: PassportSpec) {
  const avgFacePercent = (spec.faceMinPercent + spec.faceMaxPercent) / 2 / 100
  const faceHeight = photoHeight * avgFacePercent
  const faceWidth = faceHeight * 0.75 // Face width to height ratio

  // Center the face horizontally and vertically (slightly above center)
  const faceTop = (photoHeight - faceHeight) / 2 - (photoHeight * 0.05)
  const faceLeft = (photoWidth - faceWidth) / 2

  return {
    x: faceLeft,
    y: Math.max(0, faceTop),
    width: faceWidth,
    height: faceHeight,
  }
}
