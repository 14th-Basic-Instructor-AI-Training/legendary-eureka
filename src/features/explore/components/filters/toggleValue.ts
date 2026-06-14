/** Add a value to the array if absent, remove it if present (immutable). */
export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}
