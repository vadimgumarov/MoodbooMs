import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to interact with Electron store
 * Provides a consistent interface for accessing and updating stored data
 */
export function useStore(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial value from store
  useEffect(() => {
    const loadValue = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (window.electronAPI?.store?.get) {
          const storedValue = await window.electronAPI.store.get(key);
          setValue(storedValue ?? defaultValue);
        }
      } catch (err) {
        console.error(`Failed to load ${key} from store:`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key, defaultValue]);

  // Update value in store
  const updateValue = useCallback(async (newValue) => {
    try {
      setError(null);
      
      if (window.electronAPI?.store?.set) {
        await window.electronAPI.store.set(key, newValue);
        setValue(newValue);
      }
    } catch (err) {
      console.error(`Failed to update ${key} in store:`, err);
      setError(err);
      throw err; // Re-throw to allow caller to handle
    }
  }, [key]);

  // Delete value from store
  const deleteValue = useCallback(async () => {
    try {
      setError(null);
      
      if (window.electronAPI?.store?.delete) {
        await window.electronAPI.store.delete(key);
        setValue(defaultValue);
      }
    } catch (err) {
      console.error(`Failed to delete ${key} from store:`, err);
      setError(err);
      throw err;
    }
  }, [key, defaultValue]);

  return {
    value,
    setValue: updateValue,
    deleteValue,
    loading,
    error,
    isAvailable: !!window.electronAPI?.store
  };
}

/**
 * Hook to get all store data at once
 */
export function useStoreData() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (window.electronAPI?.store?.getAll) {
          const allData = await window.electronAPI.store.getAll();
          setData(allData || {});
        }
      } catch (err) {
        console.error('Failed to load store data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      
      if (window.electronAPI?.store?.getAll) {
        const allData = await window.electronAPI.store.getAll();
        setData(allData || {});
      }
    } catch (err) {
      console.error('Failed to refresh store data:', err);
      setError(err);
      throw err;
    }
  }, []);

  return {
    data,
    refresh,
    loading,
    error,
    isAvailable: !!window.electronAPI?.store
  };
}