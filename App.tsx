import React, { useState, useCallback } from 'react';
import { StateSelector } from './components/StateSelector';
import { LicenseInfoDisplay } from './components/LicenseInfoDisplay';
import { ComparisonDisplay } from './components/ComparisonDisplay';
import { fetchLicenseInfo, fetchComparisonInfo } from './services/geminiService';
import { US_STATES } from './constants';
import type { LicenseInfo, ComparisonData } from './types';

const App: React.FC = () => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [viewData, setViewData] = useState<LicenseInfo | ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'initial' | 'single' | 'compare'>('initial');

  const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  const fetchSingleState = useCallback(async (state: string, bypassCache = false) => {
    setSelectedStates([state]);
    setIsLoading(true);
    setError(null);
    setViewData(null);
    setViewMode('single');

    // Caching logic
    if (!bypassCache) {
      try {
        const cachedItem = localStorage.getItem(`licenseInfo-${state}`);
        if (cachedItem) {
          const { timestamp, data } = JSON.parse(cachedItem);
          if (Date.now() - timestamp < CACHE_DURATION_MS) {
            setViewData(data);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to read from cache", e);
      }
    }
    
    try {
      const { licenseInfo: info } = await fetchLicenseInfo(state);
      setViewData(info);
      try {
        const cacheItem = { timestamp: Date.now(), data: info };
        localStorage.setItem(`licenseInfo-${state}`, JSON.stringify(cacheItem));
      } catch (e) {
        console.warn("Failed to write to cache", e);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleToggleState = useCallback((state: string) => {
    setSelectedStates(prev => {
      const isSelected = prev.includes(state);
      const newSelection = isSelected ? prev.filter(s => s !== state) : [...prev, state];
      
      // If selection changes, revert to initial state view
      setViewMode('initial');
      setViewData(null);
      setError(null);

      if (newSelection.length === 1) {
        fetchSingleState(newSelection[0]);
      }
      
      return newSelection;
    });
  }, [fetchSingleState]);

  const handleFetchComparison = useCallback(async () => {
    if (selectedStates.length < 2) return;
    setIsLoading(true);
    setError(null);
    setViewData(null);
    setViewMode('compare');
    try {
      const data = await fetchComparisonInfo(selectedStates);
      setViewData(data);
    } catch (err) {
       if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStates]);

  const renderDisplay = () => {
    if (viewMode === 'single' && viewData) {
       return (
         <LicenseInfoDisplay 
            selectedState={selectedStates[0]}
            info={viewData as LicenseInfo}
            isLoading={isLoading}
            error={error}
            onRetry={(state) => fetchSingleState(state, false)}
            onRefresh={(state) => fetchSingleState(state, true)}
          />
       );
    }
    if (viewMode === 'compare' && viewData) {
      return <ComparisonDisplay data={viewData as ComparisonData} states={selectedStates} />;
    }
    // Default view for initial, empty, or error states during multi-select phase
    return (
       <LicenseInfoDisplay 
          selectedState={null} // Pass null to show initial message
          info={null}
          isLoading={isLoading}
          error={error}
          onRetry={(state) => fetchSingleState(state)} // Retry on single state
        />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Home Care Licensing Guide
            </h1>
          </div>
          <p className="text-gray-500 mt-1">Your comprehensive resource for US state-specific home care regulations.</p>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/3 xl:w-1/4">
            <StateSelector 
              states={US_STATES} 
              selectedStates={selectedStates}
              onToggleState={handleToggleState}
              isLoading={isLoading}
              onCompare={handleFetchComparison}
            />
          </aside>
          
          <section className="lg:w-2/3 xl:w-3/4">
             {renderDisplay()}
          </section>
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 text-sm mt-8">
        <p>Powered by Google's Gemini API. Information is for guidance purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
