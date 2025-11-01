import React, { useState } from 'react';
import type { LicenseInfo } from '../types';

interface LicenseInfoDisplayProps {
  selectedState: string | null;
  info: LicenseInfo | null;
  isLoading: boolean;
  error: string | null;
  onRetry: (state: string) => void;
  onRefresh?: (state: string) => void;
}

const Accordion: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border rounded-md">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 focus:outline-none">
        <span className="font-medium text-gray-700">{title}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="p-4 border-t">{children}</div>}
    </div>
  );
}

const ResourceLink: React.FC<{ name: string; url: string; }> = ({ name, url }) => {
    const [reported, setReported] = useState(false);
    
    const handleReport = (e: React.MouseEvent) => {
        e.preventDefault();
        setReported(true);
        console.log(`Link reported as broken: ${url}`);
        setTimeout(() => setReported(false), 3000); // Reset after 3 seconds
    };

    return (
        <li className="flex items-start space-x-2 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <div className="flex-grow">
                 <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline break-all">
                    {name}
                 </a>
            </div>
            <button onClick={handleReport} title="Report broken link" className={`transition-opacity duration-200 ${reported ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {reported ? (
                     <span className="text-sm text-green-600 font-semibold">Reported!</span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                )}
            </button>
        </li>
    );
};


const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-blue-700 mb-3">{title}</h3>
    {children}
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-gray-600 font-medium">Researching Licensing Information...</p>
    <p className="text-sm text-gray-500">Please wait a moment.</p>
  </div>
);

export const LicenseInfoDisplay: React.FC<LicenseInfoDisplayProps> = ({ selectedState, info, isLoading, error, onRetry, onRefresh }) => {
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-lg mt-4 text-red-700">An Error Occurred</h3>
            <p className="text-red-600 mt-2">{error}</p>
            {selectedState && (
                <button
                    onClick={() => onRetry(selectedState)}
                    className="mt-6 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    Retry
                </button>
            )}
        </div>
      );
    }

    if (!info) {
       return (
        <div className="text-center text-gray-500">
           <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           <h2 className="mt-4 text-xl font-semibold">Welcome!</h2>
           <p className="mt-2">Select one state to view details, or multiple states to compare.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b-2 border-blue-200 pb-3">
            <h2 className="text-3xl font-bold text-gray-800">
              {selectedState} Home Care Licensing
            </h2>
            {onRefresh && selectedState && (
                 <button onClick={() => onRefresh(selectedState)} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" title="Refresh data from server">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" /></svg>
                     <span>Refresh</span>
                 </button>
            )}
        </div>
        
        <InfoCard title="Licensing Body">
          <p className="text-gray-700">{info.licensingBody}</p>
        </InfoCard>

        <InfoCard title="Types of Licenses">
          {info.licenseTypes.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {info.licenseTypes.map((type, index) => <li key={index}>{type}</li>)}
            </ul>
          ) : <p className="text-gray-500">No specific license types listed.</p>}
        </InfoCard>

         <InfoCard title="Key Requirements">
          {info.keyRequirements.length > 0 ? (
            <Accordion title={`View ${info.keyRequirements.length} requirements`}>
               <ul className="list-disc list-inside space-y-2 text-gray-700">
                {info.keyRequirements.map((req, index) => <li key={index}>{req}</li>)}
              </ul>
            </Accordion>
          ) : <p className="text-gray-500">No specific requirements listed.</p>}
        </InfoCard>

        <InfoCard title="Official Resources">
          {info.officialResources.length > 0 ? (
            <ul className="space-y-3">
              {info.officialResources.map((res, index) => (
                <ResourceLink key={index} name={res.name} url={res.url} />
              ))}
            </ul>
          ) : <p className="text-gray-500">No official resources listed.</p>}
        </InfoCard>
      </div>
    );
  };
  
  return (
     <div className={`bg-white p-6 rounded-lg shadow-md min-h-[60vh] w-full ${!info && !isLoading && !error ? 'flex items-center justify-center' : ''}`}>
        {renderContent()}
     </div>
  );
};
