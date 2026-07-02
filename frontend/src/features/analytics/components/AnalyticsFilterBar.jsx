import React from 'react';
import { Filter, X, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function AnalyticsFilterBar({ activeFilters, setFilter, clearFilters, loading }) {
  const [searchParams] = useSearchParams();

  return (
    <div className="filter-bar">
      <div className="filter-controls">
        <div className="filter-group">
          <label>YEAR</label>
          <select value={searchParams.get("year") || "2024"} onChange={(e) => setFilter("year", e.target.value)}>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div className="filter-group">
          <label>QUARTER</label>
          <select value={searchParams.get("quarter") || "Q1"} onChange={(e) => setFilter("quarter", e.target.value)}>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
        </div>
        <div className="filter-group">
          <label>REGION</label>
          <select value={searchParams.get("region") || "Global"} onChange={(e) => setFilter("region", e.target.value)}>
            <option value="Global">Global</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="APAC">APAC</option>
          </select>
        </div>
        <div className="filter-group">
          <label>BUSINESS UNIT</label>
          <select value={searchParams.get("businessUnit") || "All Units"} onChange={(e) => setFilter("businessUnit", e.target.value)}>
            <option value="All Units">All Units</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
        
        <div className="filter-actions">
          <button className="btn-primary" disabled={loading}>
            {loading ? <RefreshCw size={14} className="spin" /> : <Filter size={14} />} 
            Apply Filters
          </button>
          <button className="btn-secondary" onClick={clearFilters} disabled={loading}>
            <X size={14} /> Clear
          </button>
        </div>
      </div>
      
      {activeFilters && activeFilters.length > 0 && (
        <div className="filter-chips">
          {activeFilters.map(filter => (
            <div key={filter.id} className="chip">
              {filter.label} <X size={12} onClick={() => setFilter(filter.key, null)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
