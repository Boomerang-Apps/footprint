/**
 * Crop Calculator
 *
 * Calculates optimal crop regions based on detected faces.
 * Ensures faces are properly centered with appropriate headroom.
 */

import type {
  BoundingBox,
  DetectedFace,
  CropResult,
  CropSuggestion,
  CropCalculatorOptions,
} from '@/types/image';

/**
 * Default options for crop calculation
 */
export const DEFAULT_CROP_OPTIONS: Required<CropCalculatorOptions> = {
  aspectRatio: '1:1',
  minHeadroom: 0.15,
  maxHeadroom: 0.25,
  padding: 0.1,
  minFaceConfidence: 0.5,
  suggestRotation: true,
  maxRotationSuggestion: 15,
};

/**
 * Parses an aspect ratio string into width and height values
 */
export function parseAspectRatio(ratio: string): { width: number; height: number } {
  const parts = ratio.split(':');

  if (parts.length !== 2) {
    throw new Error(`Invalid aspect ratio format: "${ratio}". Expected format: "width:height"`);
  }

  const width = parseFloat(parts[0]);
  const height = parseFloat(parts[1]);

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    throw new Error(`Invalid aspect ratio values: "${ratio}"`);
  }

  return { width, height };
}

/**
 * Calculates the bounding box that encompasses all faces
 */
export function calculateFaceGroupBounds(faces: DetectedFace[]): BoundingBox | null {
  if (faces.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const face of faces) {
    const { x, y, width, height } = face.boundingBox;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Calculates average face rotation from detected faces
 */
export function calculateAverageRotation(faces: DetectedFace[]): number {
  const rotations = faces
    .filter((face) => face.rotation !== undefined && face.rotation !== 0)
    .map((face) => face.rotation!);

  if (rotations.length === 0) return 0;

  const sum = rotations.reduce((a, b) => a + b, 0);
  return sum / rotations.length;
}

/**
 * Calculates a centered fallback crop when no faces are detected
 */
export function calculateCenteredCrop(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: string
): BoundingBox {
  const { width: ratioWidth, height: ratioHeight } = parseAspectRatio(aspectRatio);
  const targetRatio = ratioWidth / ratioHeight;
  const imageRatio = imageWidth / imageHeight;

  let cropWidth: number;
  let cropHeight: number;

  if (imageRatio > targetRatio) {
    // Image is wider than target - constrain by height
    cropHeight = imageHeight;
    cropWidth = imageHeight * targetRatio;
  } else {
    // Image is taller than target - constrain by width
    cropWidth = imageWidth;
    cropHeight = imageWidth / targetRatio;
  }

  cropWidth = Math.round(cropWidth);
  cropHeight = Math.round(cropHeight);

  return {
    x: Math.round((imageWidth - cropWidth) / 2),
    y: Math.round((imageHeight - cropHeight) / 2),
    width: cropWidth,
    height: cropHeight,
  };
}

/**
 * Clamps a value to a range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates optimal crop region based on detected faces
 */
export function calculateFaceCrop(
  imageWidth: number,
  imageHeight: number,
  faces: DetectedFace[],
  options: CropCalculatorOptions = {}
): CropSuggestion {
  const mergedOptions = { ...DEFAULT_CROP_OPTIONS, ...options };

  // Filter faces by confidence
  const qualifiedFaces = faces.filter(
    (face) => face.confidence >= mergedOptions.minFaceConfidence
  );

  // If no qualified faces, return centered crop
  if (qualifiedFaces.length === 0) {
    const centeredCrop = calculateCenteredCrop(
      imageWidth,
      imageHeight,
      mergedOptions.aspectRatio
    );

    return {
      region: centeredCrop,
      score: 0.5, // Neutral score for fallback
      includesFaces: false,
      faceCount: 0,
    };
  }

  // Get the bounding box that contains all faces
  const faceBounds = calculateFaceGroupBounds(qualifiedFaces)!;

  // Add padding around face group
  const paddingX = faceBounds.width * mergedOptions.padding;
  const paddingY = faceBounds.height * mergedOptions.padding;

  const expandedBounds = {
    x: faceBounds.x - paddingX,
    y: faceBounds.y - paddingY,
    width: faceBounds.width + paddingX * 2,
    height: faceBounds.height + paddingY * 2,
  };

  // Parse aspect ratio
  const { width: ratioWidth, height: ratioHeight } = parseAspectRatio(mergedOptions.aspectRatio);
  const targetRatio = ratioWidth / ratioHeight;

  // Calculate headroom (space above faces)
  // Use the middle of the allowed range
  const headroomRatio = (mergedOptions.minHeadroom + mergedOptions.maxHeadroom) / 2;

  // Calculate crop dimensions that fit the face group with headroom
  let cropWidth: number;
  let cropHeight: number;

  // Start with the expanded bounds
  const requiredWidth = expandedBounds.width;
  const requiredHeight = expandedBounds.height * (1 + headroomRatio);

  // Adjust to match target aspect ratio
  const requiredRatio = requiredWidth / requiredHeight;

  if (requiredRatio > targetRatio) {
    // Need to increase height to match ratio
    cropWidth = requiredWidth;
    cropHeight = requiredWidth / targetRatio;
  } else {
    // Need to increase width to match ratio
    cropHeight = requiredHeight;
    cropWidth = requiredHeight * targetRatio;
  }

  // Ensure crop doesn't exceed image dimensions
  const maxCropByWidth = imageWidth;
  const maxCropByHeight = imageHeight;

  if (cropWidth > maxCropByWidth) {
    cropWidth = maxCropByWidth;
    cropHeight = cropWidth / targetRatio;
  }

  if (cropHeight > maxCropByHeight) {
    cropHeight = maxCropByHeight;
    cropWidth = cropHeight * targetRatio;
  }

  cropWidth = Math.round(cropWidth);
  cropHeight = Math.round(cropHeight);

  // Position crop to center faces horizontally and add headroom vertically
  const faceCenterX = faceBounds.x + faceBounds.width / 2;
  const faceCenterY = faceBounds.y + faceBounds.height / 2;

  // Horizontal: center on faces
  let cropX = Math.round(faceCenterX - cropWidth / 2);

  // Vertical: position faces in lower portion to add headroom
  // Faces should be at about 60-70% down from top
  const faceVerticalPosition = 0.65;
  let cropY = Math.round(faceCenterY - cropHeight * faceVerticalPosition);

  // Clamp to image bounds
  cropX = clamp(cropX, 0, imageWidth - cropWidth);
  cropY = clamp(cropY, 0, imageHeight - cropHeight);

  // Calculate score based on how well faces fit in the crop
  const faceAreaTotal = qualifiedFaces.reduce(
    (sum, face) => sum + face.boundingBox.width * face.boundingBox.height,
    0
  );
  const cropArea = cropWidth * cropHeight;
  const faceRatio = faceAreaTotal / cropArea;

  // Ideal face ratio is around 15-30% of crop area for portraits
  const idealMinRatio = 0.15;
  const idealMaxRatio = 0.30;
  let score: number;

  if (faceRatio < idealMinRatio) {
    score = 0.5 + (faceRatio / idealMinRatio) * 0.25;
  } else if (faceRatio > idealMaxRatio) {
    score = 0.75 - (faceRatio - idealMaxRatio) * 0.5;
  } else {
    score = 0.75 + ((faceRatio - idealMinRatio) / (idealMaxRatio - idealMinRatio)) * 0.25;
  }

  // Boost score based on confidence of detected faces
  const avgConfidence = qualifiedFaces.reduce((sum, f) => sum + f.confidence, 0) / qualifiedFaces.length;
  score = score * 0.7 + avgConfidence * 0.3;

  return {
    region: {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    },
    score: clamp(score, 0, 1),
    includesFaces: true,
    faceCount: qualifiedFaces.length,
  };
}

/**
 * Calculates optimal crop region and rotation suggestion
 *
 * @param imageWidth - Width of the source image
 * @param imageHeight - Height of the source image
 * @param faces - Detected faces from face detection
 * @param options - Crop calculation options
 * @returns Complete crop result with suggestion and rotation
 */
export function calculateOptimalCrop(
  imageWidth: number,
  imageHeight: number,
  faces: DetectedFace[],
  options: CropCalculatorOptions = {}
): CropResult {
  const mergedOptions = { ...DEFAULT_CROP_OPTIONS, ...options };

  // Filter faces by confidence
  const qualifiedFaces = faces.filter(
    (face) => face.confidence >= mergedOptions.minFaceConfidence
  );

  // Calculate crop suggestion
  const suggestedCrop = calculateFaceCrop(imageWidth, imageHeight, qualifiedFaces, mergedOptions);

  // Calculate rotation suggestion
  let suggestedRotation = 0;

  if (mergedOptions.suggestRotation && qualifiedFaces.length > 0) {
    const avgRotation = calculateAverageRotation(qualifiedFaces);

    // Only suggest rotation if significant and within limits
    if (Math.abs(avgRotation) >= 5 && Math.abs(avgRotation) <= mergedOptions.maxRotationSuggestion) {
      suggestedRotation = -avgRotation; // Negative to correct the tilt
    }
  }

  return {
    imageWidth,
    imageHeight,
    suggestedCrop,
    suggestedRotation: Math.round(suggestedRotation * 10) / 10, // Round to 1 decimal
    detectedFaces: qualifiedFaces,
    targetAspectRatio: mergedOptions.aspectRatio,
  };
}

/**
 * Validates if a crop region is within image bounds
 */
export function isValidCropRegion(
  crop: BoundingBox,
  imageWidth: number,
  imageHeight: number
): boolean {
  return (
    crop.x >= 0 &&
    crop.y >= 0 &&
    crop.width > 0 &&
    crop.height > 0 &&
    crop.x + crop.width <= imageWidth &&
    crop.y + crop.height <= imageHeight
  );
}

/**
 * Adjusts crop region to fit within image bounds
 */
export function adjustCropToFit(
  crop: BoundingBox,
  imageWidth: number,
  imageHeight: number
): BoundingBox {
  let { x, y, width, height } = crop;

  // Clamp dimensions
  width = Math.min(width, imageWidth);
  height = Math.min(height, imageHeight);

  // Clamp position
  x = clamp(x, 0, imageWidth - width);
  y = clamp(y, 0, imageHeight - height);

  return { x, y, width, height };
}
