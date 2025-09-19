import firebase from "firebase/compat/app"

/**
 * Transforms `firebase.firestore.Timestamp` properties in type `T` to a format
 * `{ _seconds: number; _nanoseconds: number }` for serialization. This conversion
 * is applied recursively to ensure all nested Timestamps are also serialized.
 *
 * @template T - The type to transform for serialization.
 */
export type SerializeTimestamps<T> = {
   [P in keyof T]: T[P] extends firebase.firestore.Timestamp
      ? { _seconds: number; _nanoseconds: number }
      : T[P] extends object
      ? SerializeTimestamps<T[P]>
      : T[P]
}

/**
 * Transforms serialized timestamp objects `{ _seconds: number; _nanoseconds: number }`
 * back to `firebase.firestore.Timestamp` properties in type `T`. This conversion
 * is applied recursively to ensure all nested serialized timestamps are also deserialized.
 *
 * @template T - The type to transform for deserialization.
 */
export type DeserializeTimestamps<T> = {
   [P in keyof T]: T[P] extends { _seconds: number; _nanoseconds: number }
      ? firebase.firestore.Timestamp
      : T[P] extends object
      ? DeserializeTimestamps<T[P]>
      : T[P]
}

/**
 * Serializes Firebase timestamps in an object to a format suitable for storage/transmission.
 * Converts `firebase.firestore.Timestamp` objects to `{ _seconds: number; _nanoseconds: number }`.
 * This function is recursive for nested objects and arrays, ensuring all timestamps are properly converted.
 *
 * @template T - The type of the object to serialize.
 * @param {T} obj - The object containing Firebase timestamps to serialize.
 * @returns {SerializeTimestamps<T>} - The serialized object with timestamps converted.
 */
export const serializeTimestamps = <T extends Record<string, any>>(
   obj: T
): SerializeTimestamps<T> => {
   if (obj === null || obj === undefined) return null
   const convertValue = (value: unknown): unknown => {
      if (
         value &&
         typeof value === "object" &&
         value instanceof firebase.firestore.Timestamp
      ) {
         return {
            _seconds: value.seconds,
            _nanoseconds: value.nanoseconds,
         }
      } else if (value && typeof value === "object") {
         return Array.isArray(value)
            ? value.map(convertValue)
            : Object.fromEntries(
                 Object.entries(value).map(([k, v]) => [k, convertValue(v)])
              )
      }
      return value
   }

   return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertValue(value)])
   ) as SerializeTimestamps<T>
}

/**
 * Deserializes timestamp objects back to Firebase timestamps.
 * Converts `{ _seconds: number; _nanoseconds: number }` objects back to `firebase.firestore.Timestamp`.
 * This function is recursive for nested objects and arrays, ensuring all timestamps are properly converted.
 *
 * @template T - The type of the object to deserialize.
 * @param {T} obj - The object containing serialized timestamps to deserialize.
 * @returns {DeserializeTimestamps<T>} - The deserialized object with timestamps converted.
 */
export const deserializeTimestamps = <T extends Record<string, any>>(
   obj: T
): DeserializeTimestamps<T> => {
   const convertValue = (value: unknown): unknown => {
      if (
         typeof value === "object" &&
         value !== null &&
         "_seconds" in value &&
         "_nanoseconds" in value &&
         typeof value._seconds === "number" &&
         typeof value._nanoseconds === "number"
      ) {
         return new firebase.firestore.Timestamp(
            value._seconds,
            value._nanoseconds
         )
      } else if (value && typeof value === "object") {
         return Array.isArray(value)
            ? value.map(convertValue)
            : Object.fromEntries(
                 Object.entries(value).map(([k, v]) => [k, convertValue(v)])
              )
      }
      return value
   }

   return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertValue(value)])
   ) as DeserializeTimestamps<T>
}
