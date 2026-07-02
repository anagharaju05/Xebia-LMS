import React from 'react';
import AnalyticsFilterBar from './components/AnalyticsFilterBar.jsx';
import { useSearchParams } from 'react-router-dom';

export default function AnalyticsLayout({ title, subtitle, children }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const setFilter = (key, value) => {
    if (!value) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="analytics-layout-container">
      <div className="analytics-header">
        <div className="header-titles">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      
      <AnalyticsFilterBar 
        activeFilters={[]} 
        setFilter={setFilter} 
        clearFilters={clearFilters} 
        loading={false} 
      />
      
      <div className="analytics-content">
        {children}
      </div>
    </div>
  );
}
