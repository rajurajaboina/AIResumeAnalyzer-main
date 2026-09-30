import { useState, useCallback } from 'react';

/**
 * useApi — a minimal hook for executing API calls with loading / error state.
 *
 * Usage:
 *   const { execute, data, loading, error, reset } = useApi(someApiFn);
 *   await execute(arg1, arg2);
 */
const useApi = (apiFn) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result.data ?? result);
        return result;
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Something went wrong. Please try again.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  return { execute, data, loading, error, reset };
};

export default useApi;
