import { type ReactNode } from 'react';

export interface AccountLayoutProps {
  children: ReactNode;
}

/**
 * Account Layout - Wrapper for account-related pages
 * Provides consistent layout for user account functionality
 */
export default function AccountLayout({ children }: AccountLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}