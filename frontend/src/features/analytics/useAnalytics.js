import { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth.js';

export function useAnalytics(endpoint, filters = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.region) queryParams.append('region', filters.region);
        if (filters.businessUnit) queryParams.append('businessUnit', filters.businessUnit);
        
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
        const res = await fetch(`${baseUrl}/api/analytics/${endpoint}?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Role': session?.role?.toUpperCase() || 'SUPER_ADMIN',
            'X-Organization-ID': session?.organizationId || '123e4567-e89b-12d3-a456-426614174000',
            'X-User-Id': session?.id || 'admin-1'
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const json = await res.json();
        
        if (isMounted) {
          setData(json.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [endpoint, JSON.stringify(filters)]);

  return { data, loading, error };
}
