/**
 * Image Processing Library
 *
 * Exports for image analysis, face detection, and smart cropping.
 */

// Smart cropping (content-aware)
export {
  getSuggestedCrops,
  calculateCropRegion,
  parseAspectRatio,
  isValidAspectRatio,
  PRINT_ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIOS,
  type CropRegion,
  type CropSuggestion,
  type AspectRatio,
  type SmartCropResult,
  type SmartCropOptions,
} from './faceDetection';

// Face detection
export {
  detectFaces,
  validateImageFormat,
  preprocessImage,
  clearDetectionCache,
  getCacheStats,
  MAX_IMAGE_SIZE,
  MAX_DETECTION_DIMENSION,
  SUPPORTED_FORMATS,
  DEFAULT_DETECTION_OPTIONS,
} from './face-detection';

// Crop calculator
export {
  calculateOptimalCrop,
  calculateFaceCrop,
  calculateFaceGroupBounds,
  calculateAverageRotation,
  calculateCenteredCrop,
  isValidCropRegion,
  adjustCropToFit,
  DEFAULT_CROP_OPTIONS,
} from './crop-calculator';

// Image optimization
export {
  optimizeForPrint,
  validateImage,
  getImageMetadata,
  convertToJpeg,
  getOptionsForPrintSize,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  PRINT_SIZES,
  ImageValidationError,
  type ImageOptimizeOptions,
  type ImageMetadata,
  type ImageValidationResult,
  type AllowedMimeType,
  type PrintSize,
} from './optimize';
