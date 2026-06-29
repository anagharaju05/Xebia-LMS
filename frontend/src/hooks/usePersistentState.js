import { useEffect, useState } from "react";
import { readStorageValue, writeStorageValue } from "../services/storage.service.js";

export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => readStorageValue(key, initialValue));

  useEffect(() => {
    writeStorageValue(key, value);
  }, [key, value]);

  return [value, setValue];
}