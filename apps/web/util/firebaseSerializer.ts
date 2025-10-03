import firebase from "firebase/compat/app"

/**
 * Transforms `firebase.firestore.Timestamp` and `firebase.firestore.GeoPoint` properties
 * in type `T` to serializable formats. Timestamps become `{ _seconds: number; _nanoseconds: number }`
 * and GeoPoints become `{ _latitude: number; _longitude: number }`. This conversion
 * is applied recursively to ensure all nested Firebase objects are also serialized.
 *
 * @template T - The type to transform for serialization.
 */
export type SerializedDocument<T> = {
   [P in keyof T]: T[P] extends firebase.firestore.Timestamp
      ? { _seconds: number; _nanoseconds: number }
      : T[P] extends firebase.firestore.GeoPoint
      ? { _latitude: number; _longitude: number }
      : T[P] extends object
      ? SerializedDocument<T[P]>
      : T[P]
}

/**
 * Transforms serialized Firebase objects back to their original types.
 * `{ _seconds: number; _nanoseconds: number }` objects become `firebase.firestore.Timestamp`
 * and `{ _latitude: number; _longitude: number }` objects become `firebase.firestore.GeoPoint`.
 * This conversion is applied recursively to ensure all nested serialized objects are also deserialized.
 *
 * @template T - The type to transform for deserialization.
 */
export type DeserializedDocument<T> = {
   [P in keyof T]: T[P] extends { _seconds: number; _nanoseconds: number }
      ? firebase.firestore.Timestamp
      : T[P] extends { _latitude: number; _longitude: number }
      ? firebase.firestore.GeoPoint
      : T[P] extends object
      ? DeserializedDocument<T[P]>
      : T[P]
}

/**
 * Serializes Firebase objects in a document to formats suitable for storage/transmission.
 * Converts `firebase.firestore.Timestamp` objects to `{ _seconds: number; _nanoseconds: number }`
 * and `firebase.firestore.GeoPoint` objects to `{ _latitude: number; _longitude: number }`.
 * This function is recursive for nested objects and arrays, ensuring all Firebase objects are properly converted.
 *
 * @template T - The type of the object to serialize.
 * @param {T} obj - The object containing Firebase objects to serialize.
 * @returns {SerializedDocument<T>} - The serialized object with Firebase objects converted.
 */
export const serializeDocument = <T extends Record<string, any>>(
   obj: T
): SerializedDocument<T> => {
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
      } else if (
         value &&
         typeof value === "object" &&
         value instanceof firebase.firestore.GeoPoint
      ) {
         return {
            _latitude: value.latitude,
            _longitude: value.longitude,
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
   ) as SerializedDocument<T>
}

/**
 * Deserializes Firebase objects back to their original types.
 * Converts `{ _seconds: number; _nanoseconds: number }` objects back to `firebase.firestore.Timestamp`
 * and `{ _latitude: number; _longitude: number }` objects back to `firebase.firestore.GeoPoint`.
 * This function is recursive for nested objects and arrays, ensuring all Firebase objects are properly converted.
 *
 * @template T - The type of the object to deserialize.
 * @param {T} obj - The object containing serialized Firebase objects to deserialize.
 * @returns {DeserializedDocument<T>} - The deserialized object with Firebase objects converted.
 */
export const deserializeDocument = <T extends Record<string, any>>(
   obj: T
): DeserializedDocument<T> => {
   if (obj === null || obj === undefined) return null
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
      } else if (
         typeof value === "object" &&
         value !== null &&
         "_latitude" in value &&
         "_longitude" in value &&
         typeof value._latitude === "number" &&
         typeof value._longitude === "number"
      ) {
         return new firebase.firestore.GeoPoint(
            value._latitude,
            value._longitude
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
   ) as DeserializedDocument<T>
}
