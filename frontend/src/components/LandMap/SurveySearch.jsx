import React, { useState, useEffect, useRef } from 'react';
import { getAutocompleteSuggestions } from './cadastralService';

/**
 * Real Survey Number Search with Autocomplete & Progress States
 */
export default function SurveySearch({ onSearch, isSearching, searchStatus, searchError }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Update suggestions when typing
  useEffect(() => {
    if (query.trim().length > 0) {
      const results = getAutocompleteSuggestions(query);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
      return;
    }
    if (query.trim()) {
      setShowDropdown(false);
      onSearch(query);
    }
  };

  const handleSelect = (item) => {
    setQuery(item.surveyNumber);
    setShowDropdown(false);
    onSearch(item.surveyNumber);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="gis-search-container" ref={containerRef}>
      <form className="gis-search-box" onSubmit={handleSubmit}>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2"
          className="search-mag-icon"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          placeholder="Filter by survey #, village, or owner..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          disabled={isSearching}
        />

        {query && (
          <button 
            type="button" 
            className="search-clear-btn" 
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setShowDropdown(false);
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="gis-search-dropdown">
          <div className="dropdown-label">Matching Cadastral Parcels</div>
          {suggestions.map((item, index) => (
            <div
              key={`${item.surveyNumber}-${index}`}
              className={`dropdown-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="dropdown-survey-row">
                <span className="dropdown-survey-no">{item.surveyNumber}</span>
                <span className="dropdown-area-tag">{item.area} Acres</span>
              </div>
              <div className="dropdown-sub-text">
                {item.owner} · {item.village} • {item.district}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Progress Feedback / Error Toast */}
      {searchStatus && (
        <div className="gis-search-status-badge">
          <span className="status-spinner">●</span>
          <span>{searchStatus}</span>
        </div>
      )}

      {searchError && (
        <div className="gis-search-error-badge">
          <span>⚠️ {searchError}</span>
        </div>
      )}
    </div>
  );
}
