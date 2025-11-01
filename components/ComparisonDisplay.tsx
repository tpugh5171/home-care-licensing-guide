import React, { useState } from 'react';
import type { ComparisonData, LicenseInfo } from '../types';

const Accordion: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border rounded-md mt-2">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 focus:outline-none">
        <span className="font-medium text-gray-700 text-sm">{title}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="p-3 border-t">{children}</div>}
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
        <li className="flex items-start space-x-2 group text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <div className="flex-grow">
                 <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline break-all">
                    {name}
                 </a>
            </div>
            <button onClick={handleReport} title="Report broken link" className={`transition-opacity duration-200 ${reported ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {reported ? (
                     <span className="text-xs text-green-600 font-semibold">Ok!</span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                )}
            </button>
        </li>
    );
};

const renderCellContent = (info: LicenseInfo | null, field: keyof LicenseInfo) => {
    if (!info) return <span className="text-gray-400">Not available</span>;

    switch(field) {
        case 'licensingBody':
            return <p className="text-gray-700 text-sm">{info.licensingBody}</p>;
        
        case 'licenseTypes':
        case 'keyRequirements':
            const items = info[field];
            if (items.length === 0) return <p className="text-gray-500 text-sm">None listed.</p>;
            return (
                 <Accordion title={`View ${items.length} item(s)`}>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                        {items.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                 </Accordion>
            );

        case 'officialResources':
            if (info.officialResources.length === 0) return <p className="text-gray-500 text-sm">None listed.</p>;
            return (
                <ul className="space-y-3">
                    {info.officialResources.map((res, index) => <ResourceLink key={index} name={res.name} url={res.url} />)}
                </ul>
            );
        default:
            return null;
    }
}

interface ComparisonDisplayProps {
  data: ComparisonData;
  states: string[];
}

export const ComparisonDisplay: React.FC<ComparisonDisplayProps> = ({ data, states }) => {
  const categories: { key: keyof LicenseInfo, label: string }[] = [
    { key: 'licensingBody', label: 'Licensing Body' },
    { key: 'licenseTypes', label: 'Types of Licenses' },
    { key: 'keyRequirements', label: 'Key Requirements' },
    { key: 'officialResources', label: 'Official Resources' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 border-b-2 border-blue-200 pb-3 mb-6">
        State Comparison
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 font-semibold text-left text-gray-600 border-b-2 border-gray-200 w-1/4">Category</th>
              {states.map(state => (
                <th key={state} className="p-3 font-semibold text-left text-gray-600 border-b-2 border-gray-200 w-1/4">{state}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(({ key, label }) => (
              <tr key={key} className="border-b border-gray-200">
                <td className="p-3 font-medium text-blue-800 align-top">{label}</td>
                {states.map(state => (
                  <td key={state} className="p-3 align-top">
                    {renderCellContent(data[state], key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
