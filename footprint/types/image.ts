/**
 * Image Processing Types
 *
 * Types for face detection, cropping, and image analysis.
 */

/**
 * Represents a rectangular region in an image
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A detected face with bounding box and confidence
 */
export interface DetectedFace {
  /** Bounding box of the face */
  boundingBox: BoundingBox;
  /** Confidence score (0-1) */
  confidence: number;
  /** Rotation angle in degrees (positive = clockwise) */
  rotation?: number;
  /** Facial landmarks if available */
  landmarks?: FaceLandmarks;
}

/**
 * Key facial landmarks
 */
export interface FaceLandmarks {
  leftEye?: Point;
  rightEye?: Point;
  nose?: Point;
  leftMouth?: Point;
  rightMouth?: Point;
}

/**
 * A 2D point
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Result of face detection analysis
 */
export interface FaceDetectionResult {
  /** Original image dimensions */
  imageWidth: number;
  imageHeight: number;
  /** Detected faces */
  faces: DetectedFace[];
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** Whether the result came from cache */
  cached: boolean;
}

/**
 * Options for face detection
 */
export interface FaceDetectionOptions {
  /** Minimum confidence threshold (0-1), defaults to 0.5 */
  minConfidence?: number;
  /** Maximum number of faces to return */
  maxFaces?: number;
  /** Whether to include facial landmarks */
  includeLandmarks?: boolean;
}

/**
 * A suggested crop region with metadata
 */
export interface CropSuggestion {
  /** The crop region coordinates */
  region: BoundingBox;
  /** Quality score (0-1) */
  score: number;
  /** Whether faces are included in the crop */
  includesFaces: boolean;
  /** Number of faces included */
  faceCount: number;
}

/**
 * Result of crop calculation
 */
export interface CropResult {
  /** Original image dimensions */
  imageWidth: number;
  imageHeight: number;
  /** Suggested crop for the target aspect ratio */
  suggestedCrop: CropSuggestion;
  /** Suggested rotation in degrees (0 if no rotation needed) */
  suggestedRotation: number;
  /** The detected faces used for calculation */
  detectedFaces: DetectedFace[];
  /** Target aspect ratio used */
  targetAspectRatio: string;
}

/**
 * Options for crop calculation
 */
export interface CropCalculatorOptions {
  /** Target aspect ratio (e.g., "1:1", "4:5", "3:4"), defaults to "1:1" */
  aspectRatio?: string;
  /** Minimum headroom above faces as percentage (0-1), defaults to 0.15 */
  minHeadroom?: number;
  /** Maximum headroom above faces as percentage (0-1), defaults to 0.25 */
  maxHeadroom?: number;
  /** Padding around face group as percentage of group size, defaults to 0.1 */
  padding?: number;
  /** Minimum confidence for faces to consider, defaults to 0.5 */
  minFaceConfidence?: number;
  /** Whether to suggest rotation correction */
  suggestRotation?: boolean;
  /** Maximum rotation to suggest (degrees), defaults to 15 */
  maxRotationSuggestion?: number;
}

/**
 * Supported image formats for face detection
 */
export type SupportedImageFormat = 'jpeg' | 'png' | 'heic' | 'webp';

/**
 * Image analysis request for the API
 */
export interface ImageAnalysisRequest {
  /** Base64 encoded image or URL */
  image: string;
  /** Options for face detection */
  options?: FaceDetectionOptions;
  /** Aspect ratio for crop calculation */
  aspectRatio?: string;
}

/**
 * Image analysis response from the API
 */
export interface ImageAnalysisResponse {
  /** Face detection result */
  faceDetection: FaceDetectionResult;
  /** Crop suggestion if aspect ratio was provided */
  cropSuggestion?: CropResult;
}

/**
 * Error response from the API
 */
export interface ImageAnalysisError {
  error: string;
  code: 'INVALID_IMAGE' | 'DETECTION_FAILED' | 'TIMEOUT' | 'UNAUTHORIZED' | 'UNKNOWN';
  details?: string;
}
