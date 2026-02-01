import React from 'react';
import Spinner from './common/Spinner';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  return (
    <div 
      role="status" 
      aria-label="Loading"
      className="flex flex-col items-center justify-center p-4"
    >
      <Spinner size={size} />
      <p className="mt-2 text-sm text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
