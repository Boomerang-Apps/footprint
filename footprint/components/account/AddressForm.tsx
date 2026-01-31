'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { AddressResponse, CreateAddressInput } from '@/lib/validation/address';

interface FormData {
  name: string;
  street: string;
  apartment: string;
  city: string;
  postalCode: string;
  phone: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

export interface AddressFormProps {
  /** Initial data for edit mode */
  initialData?: AddressResponse;
  /** Submit handler */
  onSubmit: (data: CreateAddressInput) => void;
  /** Cancel handler */
  onCancel: () => void;
  /** Whether form is submitting */
  isSubmitting?: boolean;
}

/**
 * AddressForm - Form for adding or editing addresses
 */
export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AddressFormProps): React.ReactElement {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    street: '',
    apartment: '',
    city: '',
    postalCode: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isEditMode = !!initialData;

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        street: initialData.street,
        apartment: initialData.apartment || '',
        city: initialData.city,
        postalCode: initialData.postalCode,
        phone: initialData.phone || '',
      });
    }
  }, [initialData]);

  const validateField = useCallback(
    (field: keyof FormData, value: string): string | undefined => {
      switch (field) {
        case 'name':
          if (!value.trim()) return 'שם הוא שדה חובה';
          if (value.length > 100) return 'שם יכול להכיל עד 100 תווים';
          break;
        case 'street':
          if (!value.trim()) return 'רחוב הוא שדה חובה';
          if (value.length > 200) return 'רחוב יכול להכיל עד 200 תווים';
          break;
        case 'city':
          if (!value.trim()) return 'עיר היא שדה חובה';
          if (value.length > 100) return 'עיר יכולה להכיל עד 100 תווים';
          break;
        case 'postalCode':
          if (!value.trim()) return 'מיקוד הוא שדה חובה';
          if (!/^\d{7}$/.test(value)) return 'מיקוד חייב להכיל 7 ספרות';
          break;
        case 'phone':
          if (value && !/^0[2-9]\d{1}-?\d{7}$/.test(value)) {
            return 'מספר טלפון לא תקין';
          }
          break;
      }
      return undefined;
    },
    []
  );

  const handleChange = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (field: keyof FormData) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (['name', 'street', 'city', 'postalCode', 'phone'] as const).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      street: true,
      city: true,
      postalCode: true,
      phone: true,
    });

    return isValid;
  }, [formData, validateField]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      const submitData: CreateAddressInput = {
        name: formData.name.trim(),
        street: formData.street.trim(),
        apartment: formData.apartment.trim() || undefined,
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        country: 'Israel',
        phone: formData.phone.trim() || undefined,
      };

      onSubmit(submitData);
    },
    [formData, onSubmit, validateForm]
  );

  return (
    <form
      data-testid="address-form"
      dir="rtl"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold text-gray-900">
        {isEditMode ? 'עריכת כתובת' : 'הוספת כתובת'}
      </h2>

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
          error={touched.name && !!errors.name}
          errorMessage={touched.name ? errors.name : undefined}
          placeholder="שם המקבל"
          required
        />
      </div>

      {/* Street */}
      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
          רחוב
        </label>
        <Input
          id="street"
          type="text"
          value={formData.street}
          onChange={handleChange('street')}
          onBlur={handleBlur('street')}
          error={touched.street && !!errors.street}
          errorMessage={touched.street ? errors.street : undefined}
          placeholder="רחוב ומספר בית"
          required
        />
      </div>

      {/* Apartment */}
      <div>
        <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
          דירה
        </label>
        <Input
          id="apartment"
          type="text"
          value={formData.apartment}
          onChange={handleChange('apartment')}
          placeholder="מספר דירה (אופציונלי)"
        />
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
          עיר
        </label>
        <Input
          id="city"
          type="text"
          value={formData.city}
          onChange={handleChange('city')}
          onBlur={handleBlur('city')}
          error={touched.city && !!errors.city}
          errorMessage={touched.city ? errors.city : undefined}
          placeholder="עיר"
          required
        />
      </div>

      {/* Postal Code */}
      <div>
        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
          מיקוד
        </label>
        <Input
          id="postalCode"
          type="text"
          value={formData.postalCode}
          onChange={handleChange('postalCode')}
          onBlur={handleBlur('postalCode')}
          error={touched.postalCode && !!errors.postalCode}
          errorMessage={touched.postalCode ? errors.postalCode : undefined}
          placeholder="1234567"
          required
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
          error={touched.phone && !!errors.phone}
          errorMessage={touched.phone ? errors.phone : undefined}
          placeholder="050-1234567"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          ביטול
        </Button>
        <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
          {isSubmitting ? 'שומר...' : 'שמירה'}
        </Button>
      </div>
    </form>
  );
}

AddressForm.displayName = 'AddressForm';
