'use client';

import { useState } from 'react';
import { FaFilter, FaMapMarkerAlt, FaBuilding, FaCalendarAlt, FaSearch } from 'react-icons/fa';

interface FiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  stateList: { id: number; name: string }[];
  facilityList: { id: number; name: string; state_id: number }[];
  showStateFilter?: boolean;
}

export interface FilterValues {
  state: string;
  facility: string;
}

export default function Filters({ onFilterChange, stateList, facilityList, showStateFilter = true }: FiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    state: '',
    facility: '',
  });
  const [filteredFacilities, setFilteredFacilities] = useState<typeof facilityList>([]);

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    if (key === 'state') {
      newFilters.facility = '';
      const filtered = value 
        ? facilityList.filter(facility => facility.state_id === parseInt(value))
        : [];
      setFilteredFacilities(filtered);
    }
    
    setFilters(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="space-y-4">
        {/* Header and Filters Grid */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter Label */}
          <div className="flex items-center gap-2 text-[#096D49] min-w-[100px]">
            <FaFilter className="h-4 w-4" />
            <h3 className="font-medium">Filters</h3>
          </div>

          {/* Filters Row */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* State Filter */}
            {showStateFilter && (
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
                <select
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:border-[#096D49] focus:ring-1 focus:ring-[#096D49]"
                >
                  <option value="">All States</option>
                  {stateList.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Facility Filter */}
            <div className="flex items-center gap-2">
              <FaBuilding className="text-gray-400 flex-shrink-0" />
              <select
                value={filters.facility}
                onChange={(e) => handleFilterChange('facility', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:border-[#096D49] focus:ring-1 focus:ring-[#096D49]"
              >
                <option value="">
                  {filters.state ? 'All Facilities' : 'Select State First'}
                </option>
                {filteredFacilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Load Button */}
          <button
            onClick={() => onFilterChange(filters)}
            className="flex-shrink-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#096D49] hover:bg-[#075238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#096D49] transition-colors"
          >
            <FaSearch className="mr-2 h-4 w-4" />
            Load
          </button>
        </div>
      </div>
    </div>
  );
}
