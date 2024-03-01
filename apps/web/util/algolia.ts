import { DeserializeTimestamps } from "types/algolia"
import firebase from "firebase/compat/app"
import { Hit } from "@algolia/client-search"

/**
 * Converts an Algolia search hit to a deserialized result type, transforming any timestamp objects
 * from `{ seconds: number; nanoseconds: number }` format back to `firebase.firestore.Timestamp`.
 * This function is recursive for nested objects and arrays, ensuring all timestamps are properly converted.
 *
 * @template AlgoliaResponseType - The type of the Algolia response hit.
 * @template DeserializedResultType - The type of the deserialized result, with timestamps converted.
 * @param {AlgoliaResponseType} hit - The Algolia search hit to convert.
 * @returns {DeserializedResultType} - The deserialized result with timestamps converted.
 */
export const deserializeAlgoliaSearchResponse = <
   AlgoliaResponseType extends Hit<unknown>,
   DeserializedResultType extends DeserializeTimestamps<AlgoliaResponseType>
>(
   hit: AlgoliaResponseType
): DeserializedResultType => {
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
      Object.entries(hit).map(([key, value]) => [key, convertValue(value)])
   ) as DeserializedResultType
}
