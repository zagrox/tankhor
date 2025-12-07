
import React, { useState } from 'react';
import { ChevronDown, Search, X, Check, Minus } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Group {
  label: string;
  options: Option[];
}

interface MultiSelectDropdownProps {
  label: string;
  groups: Group[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  groups,
  selectedValues,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const toggleGroup = (groupOptions: Option[]) => {
    const groupValues = groupOptions.map(o => o.value);
    const allSelected = groupValues.every(v => selectedValues.includes(v));

    let newValues;
    if (allSelected) {
      // Deselect all in group
      newValues = selectedValues.filter(v => !groupValues.includes(v));
    } else {
      // Select all in group (merge unique)
      const uniqueValues = new Set([...selectedValues, ...groupValues]);
      newValues = Array.from(uniqueValues);
    }
    onChange(newValues);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Filter groups based on search term
  const filteredGroups = groups.map(group => ({
    ...group,
    options: group.options.filter(opt => 
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.options.length > 0);

  return (
    <div className="multi-select-dropdown">
      <button 
        className={`dropdown-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="dropdown-label">
          {label}
          {selectedValues.length > 0 && (
            <span className="count-badge">{selectedValues.length}</span>
          )}
        </span>
        <div className="trigger-actions">
          {selectedValues.length > 0 && (
            <span 
              className="clear-icon" 
              onClick={clearSelection}
              title="پاک کردن"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={18} className={`arrow-icon ${isOpen ? 'open' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="dropdown-panel">
          <div className="dropdown-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="dropdown-options-list">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
                // Calculate group state
                const groupValues = group.options.map(o => o.value);
                const allSelected = groupValues.length > 0 && groupValues.every(v => selectedValues.includes(v));
                const someSelected = groupValues.some(v => selectedValues.includes(v));
                const isIndeterminate = someSelected && !allSelected;

                return (
                  <div key={group.label} className="option-group">
                    {/* Interactive Group Header */}
                    <div 
                      className="group-header-row" 
                      onClick={() => toggleGroup(group.options)}
                    >
                      <div className={`checkbox-custom ${allSelected || isIndeterminate ? 'selected' : ''}`}>
                        {allSelected && <Check size={12} />}
                        {isIndeterminate && <Minus size={12} />}
                      </div>
                      <span className="group-label">{group.label}</span>
                    </div>

                    {/* Options */}
                    {group.options.map((option) => {
                      const isSelected = selectedValues.includes(option.value);
                      return (
                        <label key={option.value} className={`option-item ${isSelected ? 'selected' : ''}`}>
                          <div className="checkbox-custom">
                            {isSelected && <Check size={12} />}
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOption(option.value)}
                            className="checkbox-input"
                          />
                          <span className="option-text">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              <div className="no-results">موردی یافت نشد</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
