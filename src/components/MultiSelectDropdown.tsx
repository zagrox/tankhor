
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

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
  
  // NOTE: Click-outside logic removed to act as an Accordion inside the sidebar.
  // This allows the user to keep filters open while scrolling the sidebar.

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
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
              filteredGroups.map((group) => (
                <div key={group.label} className="option-group">
                  <h4 className="group-header">{group.label}</h4>
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
              ))
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
