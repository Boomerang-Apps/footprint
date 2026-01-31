'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { AddressList } from '@/components/account/AddressList';
import { AddressForm } from '@/components/account/AddressForm';
import { useAddresses } from '@/hooks/useAddresses';
import {
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/hooks/useAddressMutations';
import type { AddressResponse, CreateAddressInput } from '@/lib/validation/address';

type FormMode = 'closed' | 'add' | 'edit';

/**
 * Addresses Page - Manage saved addresses
 */
export default function AddressesPage() {
  const router = useRouter();
  const [formMode, setFormMode] = useState<FormMode>('closed');
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AddressResponse | null>(null);

  // Data hooks
  const { data: addresses, isLoading, isError, error, refetch } = useAddresses();

  // Mutation hooks
  const createAddress = useCreateAddress({
    onSuccess: () => {
      toast.success('הכתובת נוספה בהצלחה');
      setFormMode('closed');
    },
    onError: (err) => {
      toast.error(err.message || 'שגיאה בהוספת הכתובת');
    },
  });

  const updateAddress = useUpdateAddress({
    onSuccess: () => {
      toast.success('הכתובת עודכנה בהצלחה');
      setFormMode('closed');
      setEditingAddress(null);
    },
    onError: (err) => {
      toast.error(err.message || 'שגיאה בעדכון הכתובת');
    },
  });

  const deleteAddress = useDeleteAddress({
    onSuccess: () => {
      toast.success('הכתובת נמחקה בהצלחה');
      setDeleteConfirm(null);
    },
    onError: (err) => {
      toast.error(err.message || 'שגיאה במחיקת הכתובת');
    },
  });

  const setDefaultAddress = useSetDefaultAddress({
    onSuccess: () => {
      toast.success('הכתובת הוגדרה כברירת מחדל');
    },
    onError: (err) => {
      toast.error(err.message || 'שגיאה בהגדרת ברירת מחדל');
    },
  });

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleAddNew = useCallback(() => {
    setEditingAddress(null);
    setFormMode('add');
  }, []);

  const handleEdit = useCallback((address: AddressResponse) => {
    setEditingAddress(address);
    setFormMode('edit');
  }, []);

  const handleDelete = useCallback((address: AddressResponse) => {
    setDeleteConfirm(address);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirm) {
      await deleteAddress.mutateAsync(deleteConfirm.id);
    }
  }, [deleteConfirm, deleteAddress]);

  const handleSetDefault = useCallback(
    async (address: AddressResponse) => {
      await setDefaultAddress.mutateAsync(address.id);
    },
    [setDefaultAddress]
  );

  const handleFormSubmit = useCallback(
    async (data: CreateAddressInput) => {
      if (formMode === 'add') {
        await createAddress.mutateAsync(data);
      } else if (formMode === 'edit' && editingAddress) {
        await updateAddress.mutateAsync({
          id: editingAddress.id,
          data,
        });
      }
    },
    [formMode, editingAddress, createAddress, updateAddress]
  );

  const handleFormCancel = useCallback(() => {
    setFormMode('closed');
    setEditingAddress(null);
  }, []);

  const isActionLoading =
    createAddress.isPending ||
    updateAddress.isPending ||
    deleteAddress.isPending ||
    setDefaultAddress.isPending;

  return (
    <div
      data-testid="addresses-page"
      dir="rtl"
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              aria-label="חזרה"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">כתובות שמורות</h1>
          </div>
          {formMode === 'closed' && (
            <Button onClick={handleAddNew} size="sm">
              <Plus className="h-4 w-4 ml-1" />
              הוספת כתובת
            </Button>
          )}
        </div>

        {/* Form Modal/Section */}
        {formMode !== 'closed' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <AddressForm
              initialData={editingAddress || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isSubmitting={createAddress.isPending || updateAddress.isPending}
            />
          </div>
        )}

        {/* Address List */}
        {formMode === 'closed' && (
          <AddressList
            addresses={addresses || []}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
            onRetry={refetch}
            onAddNew={handleAddNew}
            actionLoading={isActionLoading}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full" dir="rtl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                האם למחוק את הכתובת?
              </h3>
              <p className="text-gray-600 mb-6">
                הכתובת &quot;{deleteConfirm.name}&quot; תימחק לצמיתות.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleteAddress.isPending}
                >
                  ביטול
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  disabled={deleteAddress.isPending}
                  loading={deleteAddress.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  מחק
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
