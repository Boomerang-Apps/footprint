'use client';

import { Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AddressResponse } from '@/lib/validation/address';

export interface AddressCardProps {
  address: AddressResponse;
  onEdit: (address: AddressResponse) => void;
  onDelete: (address: AddressResponse) => void;
  onSetDefault: (address: AddressResponse) => void;
  isLoading?: boolean;
}

/**
 * AddressCard - Displays a saved address with action buttons
 */
export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isLoading = false,
}: AddressCardProps): React.ReactElement {
  return (
    <article
      data-testid="address-card"
      dir="rtl"
      className="bg-white border border-gray-200 rounded-lg p-4 relative"
    >
      {/* Default Badge */}
      {address.isDefault && (
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
          <Star className="w-3 h-3 fill-current" />
          ברירת מחדל
        </span>
      )}

      {/* Address Details */}
      <div className="space-y-1 mb-4">
        <h3 className="font-semibold text-gray-900">{address.name}</h3>
        <p className="text-sm text-gray-600">
          {address.street}
          {address.apartment && `, ${address.apartment}`}
        </p>
        <p className="text-sm text-gray-600">
          {address.city}, {address.postalCode}
        </p>
        {address.phone && (
          <p className="text-sm text-gray-600">{address.phone}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(address)}
          disabled={isLoading}
          aria-label="עריכה"
        >
          <Pencil className="w-4 h-4 ml-1" />
          עריכה
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(address)}
          disabled={isLoading}
          aria-label="מחיקה"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 ml-1" />
          מחיקה
        </Button>
        {!address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(address)}
            disabled={isLoading}
            aria-label="קבע כברירת מחדל"
          >
            <Star className="w-4 h-4 ml-1" />
            ברירת מחדל
          </Button>
        )}
      </div>
    </article>
  );
}

AddressCard.displayName = 'AddressCard';
