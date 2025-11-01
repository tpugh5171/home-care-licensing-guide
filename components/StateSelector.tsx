import React, { useState, useMemo } from 'react';

interface StateSelectorProps {
  states: string[];
  selectedStates: string[];
  onToggleState: (state: string) => void;
  isLoading: boolean;
  onCompare: () => void;
}

export const StateSelector: React.FC<StateSelectorProps> = ({ states, selectedStates, onToggleState, isLoading, onCompare }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStates = useMemo(() => 
    states.filter(state => 
      state.toLowerCase().includes(searchTerm.toLowerCase())
    ), [states, searchTerm]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Select State(s)</h2>
      
      <input
        type="text"
        placeholder="Search for a state..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <div className="flex-grow overflow-y-auto pr-2">
        <ul className="space-y-1">
          {filteredStates.map((state) => {
            const isSelected = selectedStates.includes(state);
            return (
              <li key={state}>
                <label
                  className={`w-full flex items-center text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 cursor-pointer
                    ${ isLoading ? 'cursor-not-allowed text-gray-400' : 'hover:bg-blue-100 hover:text-blue-800' }
                    ${ isSelected ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-600' }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleState(state)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3">{state}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {selectedStates.length > 1 && (
        <div className="mt-4 border-t pt-4">
           <button
             onClick={onCompare}
             disabled={isLoading}
             className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
           >
             {isLoading ? 'Loading...' : `Compare ${selectedStates.length} States`}
           </button>
        </div>
      )}
    </div>
  );
};
