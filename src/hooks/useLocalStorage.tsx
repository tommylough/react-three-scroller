import { useState, useEffect, useCallback, useRef } from "react";
import { getErrorMessage } from "../utils/fileIUtils";

/**
 * Hook for managing data in localStorage with React state synchronization
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Initial value if no data exists in localStorage
 * @returns {object} Storage utilities and state
 */

export function useLocalStorage<T = any>(
  key: string,
  initialValue: T | null = null,
) {
  const [data, setData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValueRef = useRef(initialValue);

  // Load data from localStorage
  const loadData = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      const jsonString = localStorage.getItem(key);
      if (jsonString === null) {
        setData(initialValueRef.current);
        return;
      }

      const parsed = JSON.parse(jsonString);
      setData(parsed);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(`Failed to load data: ${errorMessage}`);
      setData(initialValueRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [key]); // Removed initialValue from dependencies

  // Save data to localStorage
  const saveData = useCallback(
    (newData: T | null) => {
      try {
        setError(null);

        if (newData === null || newData === undefined) {
          localStorage.removeItem(key);
          setData(null);
          return true;
        }

        const jsonString = JSON.stringify(newData, null, 2);
        localStorage.setItem(key, jsonString);
        setData(newData);

        return true;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(`Failed to save data: ${errorMessage}`);
        return false;
      }
    },
    [key],
  );

  // Clear data
  const clearData = useCallback(() => {
    localStorage.removeItem(key);
    setData(null);
    setError(null);
  }, [key]);

  // Update specific property in object data
  const updateProperty = useCallback(
    (property: string, value: any) => {
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return false;
      }

      const newData = { ...data, [property]: value };
      return saveData(newData);
    },
    [data, saveData],
  );

  // Add item to array data
  const addItem = useCallback(
    (item: object) => {
      if (Array.isArray(data)) {
        const newData = [...(data as any[]), item];
        return saveData(newData as T);
      } else if (data && typeof data === "object") {
        const property = `item_${Date.now()}`;
        return updateProperty(property, item);
      } else {
        // If data is null or primitive, create new array
        return saveData([item] as T);
      }
    },
    [data, saveData, updateProperty],
  );

  // Remove item from data
  const removeItem = useCallback(
    (keyOrIndex: string | number) => {
      if (Array.isArray(data)) {
        const arrayData: any[] = data;
        const newData = arrayData.filter(
          (_, index: number) => index !== keyOrIndex,
        );
        return saveData(newData as T);
      } else if (data && typeof data === "object") {
        const objectData = data as Record<string, any>;
        const { [keyOrIndex as string]: removed, ...newData } = objectData;
        return saveData(newData as T);
      }
      return false;
    },
    [data, saveData],
  );

  // Merge new data with existing data
  const mergeData = useCallback(
    (newData: any[]) => {
      if (Array.isArray(data) && Array.isArray(newData)) {
        return saveData([...(data as any[]), ...newData] as T);
      } else if (
        data &&
        typeof data === "object" &&
        typeof newData === "object"
      ) {
        return saveData({ ...data, ...newData });
      } else {
        return saveData(newData as T);
      }
    },
    [data, saveData],
  );

  // Load data on mount or when key changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update the ref if initialValue changes
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // Listen for localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, loadData]);

  return {
    data,
    isLoading,
    error,
    saveData,
    clearData,
    updateProperty,
    addItem,
    removeItem,
    mergeData,
    reload: loadData,
  };
}
