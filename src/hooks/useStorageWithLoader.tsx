import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useDataLoader } from "./useDataLoader";
import { getErrorMessage } from "../utils/fileIUtils";

/**
 * Combined hook that provides both localStorage functionality and data loading capabilities
 * Perfect for scenarios where you need to load data from files/URLs and save to localStorage
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Initial value if no data exists
 * @returns {object} Combined storage and loading utilities
 */
export function useStorageWithLoader(key: string, initialValue = null) {
  const storage = useLocalStorage(key, initialValue);
  const loader = useDataLoader();

  // Load data from a source and save to localStorage
  const loadAndSave = useCallback(
    async (source: string | File | object, filename: string | null = null) => {
      try {
        let data;

        if (typeof source === "string") {
          // Assume it's a URL
          data = await loader.loadFromUrl(source);
        } else if (source instanceof File) {
          // It's a file
          data = await loader.loadFromFile(source as unknown as string);
        } else if (typeof source === "object" && source !== null) {
          // It's already parsed data
          data = source;
        } else {
          throw new Error(
            "Invalid source type. Expected URL string, File object, or data object.",
          );
        }

        const success = storage.saveData(data);
        if (success && filename) {
          console.log(
            `Data loaded and saved to localStorage as '${key}' from ${filename}`,
          );
        }

        return { success, data };
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Failed to load and save:", error);
        return { success: false, error: errorMessage };
      }
    },
    [key, storage, loader],
  );

  // Load from file and save with automatic filename detection
  const loadFileAndSave = useCallback(
    async (file: File) => {
      const result = await loadAndSave(file, file.name);
      return result;
    },
    [loadAndSave],
  );

  // Load from URL and save with automatic naming
  const loadUrlAndSave = useCallback(
    async (url: string) => {
      const filename = url.split("/").pop() || "remote-data";
      const result = await loadAndSave(url, filename);
      return result;
    },
    [loadAndSave],
  );

  // Export current data to file
  const exportData = useCallback(
    (filename = null) => {
      if (!storage.data) {
        return { success: false, error: "No data to export" };
      }

      const defaultFilename = `${key}-${new Date().toISOString().split("T")[0]}.json`;
      const finalFilename = filename || defaultFilename;

      const success = loader.downloadAsFile(storage.data, finalFilename);
      return { success, filename: finalFilename };
    },
    [storage.data, loader, key],
  );

  // Import data with backup of existing data
  const importWithBackup = useCallback(
    async (source: string | File | object) => {
      // Create backup of existing data
      const backup = storage.data;
      const backupKey = `${key}_backup_${Date.now()}`;

      try {
        if (backup) {
          localStorage.setItem(backupKey, JSON.stringify(backup));
        }

        const result = await loadAndSave(source);

        if (result.success) {
          return {
            success: true,
            data: result.data,
            backupKey: backup ? backupKey : null,
          };
        } else {
          // Remove backup if import failed
          if (backup) {
            localStorage.removeItem(backupKey);
          }
          return result;
        }
      } catch (error) {
        // Remove backup if import failed
        if (backup) {
          localStorage.removeItem(backupKey);
        }
        const errorMessage = getErrorMessage(error);
        return { success: false, error: errorMessage };
      }
    },
    [storage, key, loadAndSave],
  );

  // Restore from backup
  const restoreFromBackup = useCallback(
    (backupKey: string) => {
      try {
        const backupData = localStorage.getItem(backupKey);
        if (!backupData) {
          return { success: false, error: "Backup not found" };
        }

        const parsedBackup = JSON.parse(backupData);
        const success = storage.saveData(parsedBackup);

        if (success) {
          localStorage.removeItem(backupKey); // Clean up backup
          return { success: true, data: parsedBackup };
        } else {
          return { success: false, error: "Failed to restore backup" };
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        return { success: false, error: errorMessage };
      }
    },
    [storage],
  );

  // Merge data from source with existing data
  const loadAndMerge = useCallback(
    async (source: string | File | object, mergeStrategy = "replace") => {
      try {
        const result = await loadAndSave(source);
        if (!result.success) {
          return result;
        }

        const existingData = storage.data;
        const newData = result.data;

        let mergedData;

        switch (mergeStrategy) {
          case "append":
            if (Array.isArray(existingData) && Array.isArray(newData)) {
              mergedData = [...existingData, ...newData];
            } else {
              mergedData = newData;
            }
            break;

          case "merge":
            if (
              existingData &&
              typeof existingData === "object" &&
              newData &&
              typeof newData === "object" &&
              !Array.isArray(existingData) &&
              !Array.isArray(newData)
            ) {
              mergedData = {
                ...(existingData as Record<string, any>),
                ...(newData as Record<string, any>),
              };
            } else {
              mergedData = newData;
            }
            break;

          case "replace":
          default:
            mergedData = newData;
            break;
        }

        const success = storage.saveData(mergedData);
        return { success, data: mergedData };
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        return { success: false, error: errorMessage };
      }
    },
    [storage, loadAndSave],
  );

  // Return combined interface
  return {
    // Storage properties and methods
    ...storage,

    // Loader properties and methods
    isLoadingFile: loader.isLoading,
    loaderError: loader.error,

    // Combined methods
    loadAndSave,
    loadFileAndSave,
    loadUrlAndSave,
    exportData,
    importWithBackup,
    restoreFromBackup,
    loadAndMerge,

    // Direct loader access
    loadFromFile: loader.loadFromFile,
    loadFromUrl: loader.loadFromUrl,
    loadFromText: loader.loadFromText,
    downloadAsFile: loader.downloadAsFile,
    validateJson: loader.validateJson,
  };
}
