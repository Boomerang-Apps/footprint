'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { ProfileForm } from '@/components/account/ProfileForm';

/**
 * Profile Page - User profile settings
 * Route: /account/profile
 */
export default function ProfilePage(): React.ReactElement {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBack = useCallback(() => {
    router.push('/account');
  }, [router]);

  const handleSuccess = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, []);

  return (
    <div
      data-testid="profile-page"
      dir="rtl"
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-[600px] mx-auto">
          <button
            data-testid="back-button"
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="חזור"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <h1 className="text-lg font-semibold text-gray-900">הפרופיל שלי</h1>

          <div className="w-10 h-10" />
        </div>
      </header>

      {/* Main Content */}
      <main role="main" className="max-w-[600px] mx-auto p-4 pb-24">
        <ProfileForm onSuccess={handleSuccess} />
      </main>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>הפרופיל נשמר בהצלחה</span>
          </div>
        </div>
      )}
    </div>
  );
}
