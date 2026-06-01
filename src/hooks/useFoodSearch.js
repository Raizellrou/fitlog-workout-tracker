import { useCallback, useEffect, useState } from 'react';
import { searchFoods } from '@/lib/foodData';

/**
 * Local food search — instant, offline, no API calls.
 *
 * Usage:
 *   const { query, setQuery, results, loading, clearResults } = useFoodSearch(customFoods);
 *
 * - `results` is an array of { id, name, category, variants, isCustom? }
 * - Each variant has: { label, per100g: { cal, p, c, f } }
 * - `loading` is always false (search is synchronous) but kept for API compat.
 */
export function useFoodSearch(customFoods = []) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    setResults(searchFoods(query, customFoods));
  }, [query, customFoods]);

  const clearResults = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return { query, setQuery, results, loading: false, clearResults };
}
