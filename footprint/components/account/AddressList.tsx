'use client';

import { AlertCircle, RotateCcw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AddressCard } from './AddressCard';
import type { AddressResponse } from '@/lib/validation/address';

export interface AddressListProps {
  addresses: AddressResponse[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onEdit: (address: AddressResponse) => void;
  onDelete: (address: AddressResponse) => void;
  onSetDefault: (address: AddressResponse) => void;
  onRetry: () => void;
  onAddNew?: () => void;
  actionLoading?: boolean;
}

/**
 * AddressList - Container for displaying address cards
 */
export function AddressList({
  addresses,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  onSetDefault,
  onRetry,
  onAddNew,
  actionLoading = false,
}: AddressListProps): React.ReactElement {
  // Loading state
  if (isLoading) {
    return (
      <div
        data-testid="addresses-loading"
        dir="rtl"
        className="space-y-4"
      >
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-100 rounded-lg h-40"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div
        data-testid="addresses-list"
        dir="rtl"
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          שגיאה בטעינת הכתובות
        </h3>
        <p className="text-gray-500 mb-6">
          {error?.message || 'אירעה שגיאה בטעינת הכתובות. אנא נסה שוב.'}
        </p>
        <Button onClick={onRetry} variant="outline">
          <RotateCcw className="h-4 w-4 ml-2" />
          נסה שוב
        </Button>
      </div>
    );
  }

  // Empty state
  if (addresses.length === 0) {
    return (
      <div
        data-testid="addresses-list"
        dir="rtl"
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <MapPin className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          אין כתובות שמורות
        </h3>
        <p className="text-gray-500 mb-6">
          הוסף כתובת חדשה כדי להקל על הזמנות עתידיות
        </p>
        {onAddNew && (
          <Button onClick={onAddNew}>
            הוספת כתובת
          </Button>
        )}
      </div>
    );
  }

  // List of addresses
  return (
    <div
      data-testid="addresses-list"
      dir="rtl"
      className="grid gap-4 grid-cols-1 md:grid-cols-2"
    >
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
          isLoading={actionLoading}
        />
      ))}
    </div>
  );
}

AddressList.displayName = 'AddressList';
