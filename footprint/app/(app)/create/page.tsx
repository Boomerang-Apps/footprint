'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Camera, ImageIcon, Upload, Check, Lightbulb, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import Image from 'next/image';

const STEPS = [
  { id: 'upload', label: 'העלאה' },
  { id: 'style', label: 'סגנון' },
  { id: 'tweak', label: 'עריכה' },
  { id: 'customize', label: 'התאמה' },
  { id: 'payment', label: 'תשלום' },
];

const TIPS = [
  { text: 'תמונות באיכות גבוהה', icon: Check },
  { text: 'פנים ברורות', icon: Check },
  { text: 'תאורה טבעית', icon: Check },
];

// Constants for file validation
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];

export default function CreatePage() {
  const router = useRouter();
  const { setStep, setOriginalImage, originalImage, currentStep } = useOrderStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Upload state (local to component, not in store per domain rules)
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Set current step on mount
  useEffect(() => {
    setStep('upload');
  }, [setStep]);

  // Upload file to R2 via API
  const uploadToR2 = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setPendingFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', 'direct');
      formData.append('optimize', 'true');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Store R2 URL in orderStore
      setOriginalImage(data.publicUrl, file);
      setUploadError(null);
      setPendingFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'שגיאה בהעלאת הקובץ';
      setUploadError(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  }, [setOriginalImage]);

  // Retry upload with pending file
  const handleRetry = useCallback(() => {
    if (pendingFile) {
      uploadToR2(pendingFile);
    }
  }, [pendingFile, uploadToR2]);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return;
    }
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return;
    }
    // Upload to R2
    uploadToR2(file);
  }, [uploadToR2]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleGalleryClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCameraClick = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const handleNext = useCallback(() => {
    if (originalImage && !isUploading) {
      setStep('style');
      router.push('/create/style');
    }
  }, [originalImage, isUploading, setStep, router]);

  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleReplaceImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <main className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition"
            aria-label="חזרה"
          >
            <ArrowRight className="w-5 h-5" />
            <span>חזרה</span>
          </button>

          <h1 className="text-lg font-semibold text-zinc-900">יצירת תמונה</h1>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            {/* Progress Track */}
            <div className="absolute top-4 right-0 left-0 h-1 bg-zinc-200 rounded-full">
              <div
                data-testid="progress-fill"
                className="h-full bg-gradient-to-l from-purple-600 to-pink-500 rounded-full transition-all"
                style={{ width: '20%' }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex items-center justify-between">
              {STEPS.map((step, i) => {
                const isActive = i === 0;
                return (
                  <div
                    key={step.id}
                    data-step={step.id}
                    data-active={isActive ? 'true' : 'false'}
                    className="flex flex-col items-center"
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10
                      ${isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                        : 'bg-zinc-100 text-zinc-500'}
                    `}>
                      {i + 1}
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-zinc-900">בחרו תמונה</h2>
          <p className="text-zinc-500">העלו תמונה מהגלריה או צלמו תמונה חדשה</p>
        </div>

        {/* Upload Zone */}
        {isUploading ? (
          /* Upload Progress State */
          <div
            data-testid="upload-progress"
            className="border-2 border-purple-300 rounded-2xl p-8 text-center bg-purple-50"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>

              <p className="text-zinc-900 font-medium mb-2">מעלה את התמונה...</p>
              <p className="text-zinc-500 text-sm mb-4">אנא המתינו</p>

              {/* Progress Bar */}
              <div className="w-full max-w-xs h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-2">{uploadProgress}%</p>
            </div>
          </div>
        ) : uploadError ? (
          /* Upload Error State */
          <div
            data-testid="upload-error"
            className="border-2 border-red-300 rounded-2xl p-8 text-center bg-red-50"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>

              <p className="text-zinc-900 font-medium mb-2">שגיאה בהעלאה</p>
              <p className="text-zinc-500 text-sm mb-4">{uploadError}</p>

              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition"
                aria-label="נסה שוב"
              >
                <RefreshCw className="w-5 h-5" />
                <span>נסה שוב</span>
              </button>
            </div>
          </div>
        ) : !originalImage ? (
          /* Default Upload Zone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center transition-all
              ${isDragging
                ? 'border-purple-500 bg-purple-50'
                : 'border-zinc-300 hover:border-purple-400'}
            `}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-purple-600" />
              </div>

              <p className="text-zinc-900 font-medium mb-2">הקישו לבחירת תמונה</p>
              <p className="text-zinc-500 text-sm mb-6">או גררו תמונה לכאן</p>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleGalleryClick}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>בחירה מהגלריה</span>
                </button>

                <button
                  onClick={handleCameraClick}
                  className="flex items-center gap-2 px-6 py-3 border border-zinc-300 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50 transition"
                >
                  <Camera className="w-5 h-5" />
                  <span>צילום</span>
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                JPG, PNG, HEIC עד 20MB
              </p>
            </div>
          </div>
        ) : (
          /* Preview State */
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200">
            <Image
              src={originalImage}
              alt="התמונה שלך"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
            />

            {/* Ready Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-full text-sm font-medium">
              <Check className="w-4 h-4" />
              <span>מוכן</span>
            </div>

            {/* Replace Button */}
            <button
              onClick={handleReplaceImage}
              className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-zinc-700 rounded-lg text-sm font-medium hover:bg-white transition"
            >
              <ImageIcon className="w-4 h-4" />
              <span>החלפת תמונה</span>
            </button>
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Tips Section */}
        <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-zinc-900">טיפים לתוצאה מושלמת</h3>
          </div>
          <ul className="space-y-3">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-zinc-700">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span>{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleNext}
            disabled={!originalImage || isUploading}
            className={`
              w-full py-4 rounded-xl font-medium text-lg transition
              ${originalImage && !isUploading
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90'
                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}
            `}
          >
            המשך לבחירת סגנון
          </button>
        </div>
      </div>
    </main>
  );
}
