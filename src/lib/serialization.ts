/**
 * Utility to serialize Prisma types for client components
 * Converts Decimal to number, Date to ISO string, etc.
 */

/**
 * Recursive type that converts Prisma non-serializable types to serializable ones
 * - Decimal → number
 * - Date → string (ISO format)
 * - BigInt → string
 */
export type Serialized<T> = T extends Date
  ? string
  : T extends bigint
    ? string
    : T extends { toNumber: () => number }
      ? number
      : T extends (infer U)[]
        ? Serialized<U>[]
        : T extends object
          ? { [K in keyof T]: Serialized<T[K]> }
          : T;

/**
 * Recursively converts Prisma types to serializable formats:
 * - Decimal objects → number via toNumber()
 * - Date objects → ISO string
 * - BigInt → string
 * - Arrays → mapped recursively
 * - Objects → mapped recursively
 * - Primitives → unchanged
 */
export function serialize<T>(data: T): Serialized<T> {
  if (data === null || data === undefined) {
    return data as Serialized<T>;
  }

  // Handle Decimal (has toNumber method)
  if (
    typeof data === 'object' &&
    data !== null &&
    'toNumber' in data &&
    typeof (data as any).toNumber === 'function'
  ) {
    return (data as any).toNumber() as Serialized<T>;
  }

  // Handle Date
  if (data instanceof Date) {
    return data.toISOString() as Serialized<T>;
  }

  // Handle BigInt
  if (typeof data === 'bigint') {
    return data.toString() as Serialized<T>;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => serialize(item)) as Serialized<T>;
  }

  // Handle plain objects
  if (typeof data === 'object' && data !== null) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serialize(value);
    }
    return result as Serialized<T>;
  }

  // Primitives (string, number, boolean) - return as-is
  return data as Serialized<T>;
}

/**
 * Type guard to check if value is a Decimal-like object
 */
function isDecimalLike(value: unknown): value is { toNumber: () => number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in value &&
    typeof (value as any).toNumber === 'function'
  );
}
