import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStyles } from '../services/styleService';
import { Style } from '../types/style';
import LoadingSpinner from '../components/LoadingSpinner';

const StyleList: React.FC = () => {
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data: styles = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Style[]>({
    queryKey: ['styles'],
    queryFn: fetchStyles,
    enabled: shouldFetch,
  });

  const handleLoadStyles = () => {
    setShouldFetch(true);
    if (shouldFetch) {
      refetch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Style List</h1>
        
        {/* AC-001: Page displays Load Styles button */}
        <div className="mb-6">
          <button
            onClick={handleLoadStyles}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            aria-label="Load Styles"
          >
            {isLoading ? 'Loading...' : 'Load Styles'}
          </button>
        </div>

        {/* AC-002: Clicking shows loading spinner */}
        {isLoading && (
          <LoadingSpinner message="Loading styles..." />
        )}

        {/* Error handling */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              Error loading styles: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {/* AC-005: Results display as list with style names */}
        {!isLoading && styles.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Styles ({styles.length})
              </h2>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
              {styles.map((style) => (
                <li key={style.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {style.name}
                      </h3>
                      {style.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {style.description}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && shouldFetch && styles.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">No styles found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleList;
