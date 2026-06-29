export function readStorageValue(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function writeStorageValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}