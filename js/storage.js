const STORAGE_PREFIX = 'sama-dahira:';

export function save(key, value) {
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
}

export function load(key, fallback = null) {
  const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  return value === null ? fallback : JSON.parse(value);
}
