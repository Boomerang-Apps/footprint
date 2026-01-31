'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { AvatarUpload } from './AvatarUpload';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface FormData {
  name: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
}

export interface ProfileFormProps {
  /** Callback when profile is successfully updated */
  onSuccess?: () => void;
  /** Optional className */
  className?: string;
}

/**
 * ProfileForm - Component for editing user profile
 * Includes name, phone editing and avatar upload
 */
export function ProfileForm({
  onSuccess,
  className = '',
}: ProfileFormProps): React.ReactElement {
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const {
    mutateAsync: updateProfile,
    isPending: isUpdating,
    isError: isUpdateError,
  } = useUpdateProfile();

  const [formData, setFormData] = useState<FormData>({ name: '', phone: '' });
  const [originalData, setOriginalData] = useState<FormData>({
    name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      const data = {
        name: profile.name || '',
        phone: profile.phone || '',
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [profile]);

  const validateField = useCallback(
    (field: keyof FormData, value: string): string | undefined => {
      if (field === 'name') {
        if (value.length < 2) {
          return 'שם חייב להכיל לפחות 2 תווים';
        }
        if (value.length > 50) {
          return 'שם יכול להכיל עד 50 תווים';
        }
      }

      if (field === 'phone' && value) {
        // Israeli phone format: 05X-XXXXXXX or 0X-XXXXXXX
        const phoneRegex = /^0\d{1,2}-?\d{7}$/;
        if (!phoneRegex.test(value)) {
          return 'מספר טלפון לא תקין';
        }
      }

      return undefined;
    },
    []
  );

  const handleChange = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      setSubmitError(null);
    },
    []
  );

  const handleBlur = useCallback(
    (field: keyof FormData) => () => {
      const error = validateField(field, formData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  const isFormChanged = useCallback(() => {
    return (
      formData.name !== originalData.name ||
      formData.phone !== originalData.phone
    );
  }, [formData, originalData]);

  const isFormValid = useCallback(() => {
    const nameError = validateField('name', formData.name);
    const phoneError = validateField('phone', formData.phone);
    return !nameError && !phoneError;
  }, [formData, validateField]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      // Validate all fields
      const nameError = validateField('name', formData.name);
      const phoneError = validateField('phone', formData.phone);

      if (nameError || phoneError) {
        setErrors({ name: nameError, phone: phoneError });
        return;
      }

      // Build update payload with only changed fields
      const updates: { name?: string; phone?: string | null } = {};
      if (formData.name !== originalData.name) {
        updates.name = formData.name;
      }
      if (formData.phone !== originalData.phone) {
        updates.phone = formData.phone || null;
      }

      if (Object.keys(updates).length === 0) {
        return;
      }

      try {
        await updateProfile(updates);
        setOriginalData(formData);
        onSuccess?.();
      } catch {
        setSubmitError('שגיאה בשמירת הפרופיל');
      }
    },
    [formData, originalData, validateField, updateProfile, onSuccess]
  );

  const handleAvatarUploadSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <div data-testid="profile-loading" className="animate-pulse space-y-4">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
        </div>
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          שגיאה בטעינת הפרופיל
        </h3>
        <p className="text-gray-500 mb-6">
          {error?.message || 'אירעה שגיאה בטעינת הפרופיל. אנא נסה שוב.'}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RotateCcw className="h-4 w-4 ml-2" />
          נסה שוב
        </Button>
      </div>
    );
  }

  return (
    <form
      data-testid="profile-form"
      dir="rtl"
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
    >
      {/* Avatar */}
      <AvatarUpload
        currentAvatarUrl={profile?.avatarUrl || null}
        onUploadSuccess={handleAvatarUploadSuccess}
      />

      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          אימייל
        </label>
        <div className="text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          {profile?.email}
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          שם
        </label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          onBlur={handleBlur('name')}
          error={!!errors.name}
          errorMessage={errors.name}
          placeholder="הכנס שם"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          טלפון
        </label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange('phone')}
          onBlur={handleBlur('phone')}
          error={!!errors.phone}
          errorMessage={errors.phone}
          placeholder="050-1234567"
        />
      </div>

      {/* Submit Error */}
      {(submitError || isUpdateError) && (
        <p className="text-sm text-red-500 text-center" role="alert">
          {submitError || 'שגיאה בשמירת הפרופיל'}
        </p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        disabled={!isFormChanged() || !isFormValid() || isUpdating}
        loading={isUpdating}
      >
        {isUpdating ? 'שומר...' : 'שמור'}
      </Button>
    </form>
  );
}

ProfileForm.displayName = 'ProfileForm';
