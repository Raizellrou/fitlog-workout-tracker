import { useCallback, useEffect, useRef, useState } from 'react';

const SEARCH_URL = (q) =>
  `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&json=1&page_size=6&fields=product_name,nutriments`;

/** Normalize a raw Open Food Facts product to { name, per100g }. */
function normalize(product) {
  const n = product.nutriments ?? {};
  return {
    name: (product.product_name || '').trim() || 'Unknown food',
    per100g: {
      cal: Math.round(n['energy-kcal_100g'] ?? 0),
      p: Math.round((n['proteins_100g'] ?? 0) * 10) / 10,
      c: Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10,
      f: Math.round((n['fat_100g'] ?? 0) * 10) / 10,
    },
  };
}

/**
 * Debounced food search against the Open Food Facts API.
 *
 * Usage:
 *   const { query, setQuery, results, loading, clearResults } = useFoodSearch();
 *
 * - Debounces by 350ms; only fires when query.trim().length >= 2.
 * - Cancels in-flight requests via AbortController when query changes.
 * - `results` is an array of { name: string, per100g: { cal, p, c, f } }.
 * - Does NOT throw — network errors are swallowed silently (returns empty results).
 */
export function useFoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Cancel any previous in-flight request.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const res = await fetch(SEARCH_URL(q), { signal: controller.signal });
        const data = await res.json();
        const products = (data.products ?? [])
          .filter((p) => p.product_name && p.nutriments)
          .map(normalize)
          // Remove duplicates by name (OFF can return the same item multiple times)
          .filter((p, i, arr) => arr.findIndex((x) => x.name === p.name) === i);
        setResults(products);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const clearResults = useCallback(() => {
    setQuery('');
    setResults([]);
    setLoading(false);
    abortRef.current?.abort();
  }, []);

  return { query, setQuery, results, loading, clearResults };
}
