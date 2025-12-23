/**
 * ShippingAddressForm Component
 *
 * CO-01: Enter Shipping Address
 *
 * Address form with validation and save-for-future option.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { MapPin, User, Phone, Building, Hash } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import type { Address } from '@/types';

export interface ShippingAddressFormProps {
  /** Initial address values */
  initialAddress?: Partial<Address>;
  /** Callback when form validity changes */
  onValidChange?: (isValid: boolean) => void;
  /** Disable all fields */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

interface FormErrors {
  name?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
}

interface FormTouched {
  name?: boolean;
  street?: boolean;
  city?: boolean;
  postalCode?: boolean;
  phone?: boolean;
}

const DEFAULT_COUNTRY = 'ישראל';

export default function ShippingAddressForm({
  initialAddress,
  onValidChange,
  disabled = false,
  className = '',
}: ShippingAddressFormProps): JSX.Element {
  const { setShippingAddress } = useOrderStore();

  // Form state
  const [name, setName] = useState(initialAddress?.name || '');
  const [street, setStreet] = useState(initialAddress?.street || '');
  const [city, setCity] = useState(initialAddress?.city || '');
  const [postalCode, setPostalCode] = useState(initialAddress?.postalCode || '');
  const [country, setCountry] = useState(initialAddress?.country || DEFAULT_COUNTRY);
  const [phone, setPhone] = useState(initialAddress?.phone || '');
  const [saveForFuture, setSaveForFuture] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  // Validation functions
  const validateName = useCallback((value: string): string | undefined => {
    if (!value.trim()) return 'שם הוא שדה חובה';
    if (value.trim().length < 2) return 'שם חייב להכיל לפחות 2 תווים';
    return undefined;
  }, []);

  const validateStreet = useCallback((value: string): string | undefined => {
    if (!value.trim()) return 'כתובת היא שדה חובה';
    if (value.trim().length < 5) return 'כתובת חייבת להכיל לפחות 5 תווים';
    return undefined;
  }, []);

  const validateCity = useCallback((value: string): string | undefined => {
    if (!value.trim()) return 'עיר היא שדה חובה';
    if (value.trim().length < 2) return 'עיר חייבת להכיל לפחות 2 תווים';
    return undefined;
  }, []);

  const validatePostalCode = useCallback((value: string): string | undefined => {
    if (!value.trim()) return 'מיקוד הוא שדה חובה';
    if (!/^\d{7}$/.test(value.trim())) return 'מיקוד חייב להכיל 7 ספרות';
    return undefined;
  }, []);

  const validatePhone = useCallback((value: string): string | undefined => {
    if (!value.trim()) return undefined; // Phone is optional
    if (!/^0\d{1,2}[-]?\d{7}$/.test(value.replace(/[-\s]/g, ''))) {
      return 'מספר טלפון לא תקין';
    }
    return undefined;
  }, []);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors: FormErrors = {
      name: validateName(name),
      street: validateStreet(street),
      city: validateCity(city),
      postalCode: validatePostalCode(postalCode),
      phone: validatePhone(phone),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  }, [name, street, city, postalCode, phone, validateName, validateStreet, validateCity, validatePostalCode, validatePhone]);

  // Handle field blur
  const handleBlur = useCallback((field: keyof FormTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate the specific field
    let error: string | undefined;
    switch (field) {
      case 'name':
        error = validateName(name);
        break;
      case 'street':
        error = validateStreet(street);
        break;
      case 'city':
        error = validateCity(city);
        break;
      case 'postalCode':
        error = validatePostalCode(postalCode);
        break;
      case 'phone':
        error = validatePhone(phone);
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  }, [name, street, city, postalCode, phone, validateName, validateStreet, validateCity, validatePostalCode, validatePhone]);

  // Update store when form changes
  useEffect(() => {
    const isValid = validateAll();
    onValidChange?.(isValid);

    if (isValid) {
      const address: Address = {
        name: name.trim(),
        street: street.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        phone: phone.trim() || undefined,
        isDefault: saveForFuture,
      };
      setShippingAddress(address);
    }
  }, [name, street, city, postalCode, country, phone, saveForFuture, validateAll, onValidChange, setShippingAddress]);

  const inputClasses = (hasError: boolean) => `
    w-full p-3 rounded-lg border transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent
    ${disabled ? 'bg-zinc-100 cursor-not-allowed' : 'bg-white'}
    ${hasError ? 'border-red-300 focus:ring-red-300' : 'border-zinc-300'}
  `;

  return (
    <form
      role="form"
      aria-label="כתובת למשלוח - Shipping Address"
      className={`space-y-4 ${className}`}
      onSubmit={(e) => e.preventDefault()}
    >
      <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-brand-purple" />
        כתובת למשלוח
      </h3>

      {/* Name Field */}
      <div className="space-y-1">
        <label htmlFor="shipping-name" className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <User className="w-4 h-4" />
          שם מלא <span className="text-red-500">*</span>
        </label>
        <input
          id="shipping-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name')}
          disabled={disabled}
          placeholder="ישראל ישראלי"
          aria-required="true"
          aria-invalid={touched.name && !!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={inputClasses(!!(touched.name && errors.name))}
        />
        {touched.name && errors.name && (
          <p id="name-error" className="text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Street Field */}
      <div className="space-y-1">
        <label htmlFor="shipping-street" className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <Building className="w-4 h-4" />
          רחוב ומספר <span className="text-red-500">*</span>
        </label>
        <input
          id="shipping-street"
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          onBlur={() => handleBlur('street')}
          disabled={disabled}
          placeholder="הרצל 123, דירה 4"
          aria-required="true"
          aria-invalid={touched.street && !!errors.street}
          aria-describedby={errors.street ? 'street-error' : undefined}
          className={inputClasses(!!(touched.street && errors.street))}
        />
        {touched.street && errors.street && (
          <p id="street-error" className="text-sm text-red-600">{errors.street}</p>
        )}
      </div>

      {/* City and Postal Code Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* City Field */}
        <div className="space-y-1">
          <label htmlFor="shipping-city" className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            עיר <span className="text-red-500">*</span>
          </label>
          <input
            id="shipping-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={() => handleBlur('city')}
            disabled={disabled}
            placeholder="תל אביב"
            aria-required="true"
            aria-invalid={touched.city && !!errors.city}
            aria-describedby={errors.city ? 'city-error' : undefined}
            className={inputClasses(!!(touched.city && errors.city))}
          />
          {touched.city && errors.city && (
            <p id="city-error" className="text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        {/* Postal Code Field */}
        <div className="space-y-1">
          <label htmlFor="shipping-postal" className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <Hash className="w-4 h-4" />
            מיקוד <span className="text-red-500">*</span>
          </label>
          <input
            id="shipping-postal"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            onBlur={() => handleBlur('postalCode')}
            disabled={disabled}
            placeholder="6100000"
            maxLength={7}
            aria-required="true"
            aria-invalid={touched.postalCode && !!errors.postalCode}
            aria-describedby={errors.postalCode ? 'postal-error' : undefined}
            className={inputClasses(!!(touched.postalCode && errors.postalCode))}
          />
          {touched.postalCode && errors.postalCode && (
            <p id="postal-error" className="text-sm text-red-600">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Country Field */}
      <div className="space-y-1">
        <label htmlFor="shipping-country" className="text-sm font-medium text-zinc-700">
          מדינה
        </label>
        <input
          id="shipping-country"
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          disabled={disabled}
          className={inputClasses(false)}
        />
      </div>

      {/* Phone Field */}
      <div className="space-y-1">
        <label htmlFor="shipping-phone" className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <Phone className="w-4 h-4" />
          טלפון <span className="text-zinc-400 text-xs">(אופציונלי)</span>
        </label>
        <input
          id="shipping-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => handleBlur('phone')}
          disabled={disabled}
          placeholder="050-1234567"
          aria-invalid={touched.phone && !!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          className={inputClasses(!!(touched.phone && errors.phone))}
        />
        {touched.phone && errors.phone && (
          <p id="phone-error" className="text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Save for Future Checkbox */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={saveForFuture}
          onChange={(e) => setSaveForFuture(e.target.checked)}
          disabled={disabled}
          aria-label="שמור כתובת לשימוש עתידי"
          className="w-5 h-5 rounded border-zinc-300 text-brand-purple focus:ring-brand-purple"
        />
        <span className="text-sm text-zinc-700">שמור כתובת לשימוש עתידי</span>
      </label>
    </form>
  );
}
