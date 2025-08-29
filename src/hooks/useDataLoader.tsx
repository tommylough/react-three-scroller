import { useState, useCallback } from "react";
import { getErrorMessage } from "../utils/fileIUtils.ts";

/**
 * Hook for loading JSON data from files, URLs, and downloading data as files
 * @returns {object} Loading utilities and state
 */
export function useDataLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from file input
  const loadFromFile = useCallback((file: string) => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);

      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const jsonData = JSON.parse(e.target!.result as string);
          setIsLoading(false);
          resolve(jsonData);
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          const errorMsg = `Failed to parse JSON: ${errorMessage}`;
          setError(errorMsg);
          setIsLoading(false);
          reject(new Error(errorMsg));
        }
      };

      reader.onerror = () => {
        const errorMsg = "Failed to read file";
        setError(errorMsg);
        setIsLoading(false);
        reject(new Error(errorMsg));
      };

      reader.readAsText(file as unknown as Blob);
    });
  }, []);

  // Load from URL
  const loadFromUrl = useCallback(async (url: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setIsLoading(false);
      return jsonData;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const errorMsg = `Failed to load from URL: ${errorMessage}`;
      setError(errorMsg);
      setIsLoading(false);
      throw new Error(errorMsg);
    }
  }, []);

  // Save data as downloadable JSON file
  const downloadAsFile = useCallback((data: object, filename = "data.json") => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(`Failed to download file: ${errorMessage}`);
      return false;
    }
  }, []);

  // Load from text content (for drag-and-drop or paste operations)
  const loadFromText = useCallback((textContent: string) => {
    try {
      setError(null);
      const jsonData = JSON.parse(textContent);
      return jsonData;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const errorMsg = `Failed to parse JSON text: ${errorMessage}`;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Validate JSON without parsing
  const validateJson = useCallback((jsonString: string) => {
    try {
      JSON.parse(jsonString);
      return { valid: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return { valid: false, error: errorMessage };
    }
  }, []);

  return {
    isLoading,
    error,
    loadFromFile,
    loadFromUrl,
    loadFromText,
    downloadAsFile,
    validateJson,
  };
}
