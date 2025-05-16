import { Hit, SearchResponse } from "@algolia/client-search"
import firebase from "firebase/compat/app"
import { DeserializeTimestamps, SerializeTimestamps } from "types/algolia"

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

   const entity = Object.fromEntries(
      Object.entries(hit).map(([key, value]) => [key, convertValue(value)])
   ) as DeserializedResultType & { id: string }

   entity.id = hit.objectID

   return entity
}

/**
 * Generates a filter string for arrayInFilters.
 * @param {Record<string, string[]>} arrayFilters - The array filters to apply.
 * @returns {string} The constructed filter string.
 */
export const generateArrayFilterString = (
   arrayFilters: Record<string, string[]>,
   exclude: boolean = false
): string => {
   if (!arrayFilters) return ""
   const filters = []
   // Go through each filter type (e.g., "tags", "categories").
   Object.entries(arrayFilters).forEach(([filterName, filterValues]) => {
      if (filterValues && filterValues.length > 0) {
         if (exclude) {
            // For exclusion, create a single NOT condition for the OR group
            const filterValueString = filterValues
               .filter(Boolean)
               .map((filterValue) => `NOT ${filterName}:${filterValue}`)
               .join(" AND ")

            if (filterValueString) {
               filters.push(`(${filterValueString})`)
            }
         } else {
            // Original inclusion logic with OR
            const filterValueString = filterValues
               .filter(Boolean)
               .map((filterValue) => `${filterName}:${filterValue}`)
               .join(" OR ")

            if (filterValueString) {
               filters.push(`(${filterValueString})`)
            }
         }
      }
   })

   // Link different filter types with "AND"
   return filters.join(" AND ")
}

/**
 * Generates filter strings for booleanFilters.
 * @param {Object} booleanFilters - The boolean filters to apply.
 * @returns {string[]} The constructed filter strings.
 */
export const generateBooleanFilterStrings = (
   booleanFilters: Partial<Record<string, boolean | undefined>>
): string => {
   if (!booleanFilters) return ""

   return Object.entries(booleanFilters)
      .filter(([, value]) => value !== undefined) // Filter out undefined values
      .map(([filterName, value]) => `${filterName}:${value}`)
      .join(" AND ")
}

/**
 * Generates a filter string for Algolia queries to filter results by a specific date or date range.
 *
 * @param {string} attributeName The name of the date attribute in your Algolia index.
 * @param {Date} startDate The start date of the range. Pass null if filtering by a single end date.
 * @param {Date} endDate The end date of the range. Pass null if filtering by a single start date.
 * @returns {string} The filter string to be used in Algolia queries.
 */
export const generateDateFilter = (
   attributeName: string,
   startDate: Date | null,
   endDate: Date | null
): string => {
   const startTimestamp = startDate ? startDate.getTime() : null
   const endTimestamp = endDate ? endDate.getTime() : null

   if (startTimestamp && endTimestamp) {
      // Filter between start and end dates
      return `${attributeName} >= ${startTimestamp} AND ${attributeName} <= ${endTimestamp}`
   } else if (startTimestamp) {
      // Filter from start date onwards
      return `${attributeName} >= ${startTimestamp}`
   } else if (endTimestamp) {
      // Filter up to end date
      return `${attributeName} <= ${endTimestamp}`
   }

   return ""
}

/**
 * Creates a generic Algolia search response, useful for providing fallback (initial) data to SWR.
 * This function handles timestamp serialization and object ID mapping automatically.
 *
 * @template E - The original entity type (e.g. CustomJob)
 * @template S - The serialized type for Algolia (e.g. AlgoliaCustomJobResponse)
 * @template D - The deserialized result type (e.g. CustomJobSearchResult)
 * @param entities - Array of original entities to serialize
 * @returns Array of SearchResponse
 */
export const createAlgoliaSearchResponse = <
   E extends { id: string },
   S extends SerializeTimestamps<E>,
   D extends object
>(
   entities: E[]
): (SearchResponse<S> & { deserializedHits: D[] })[] => {
   const serializeEntity = (entity: E): Hit<S> => {
      const serialized = Object.fromEntries(
         Object.entries(entity).map(([key, value]: [string, unknown]) => {
            if (
               value &&
               typeof value === "object" &&
               value instanceof firebase.firestore.Timestamp
            ) {
               return [
                  key,
                  { _seconds: value.seconds, _nanoseconds: value.nanoseconds },
               ]
            } else if (value && typeof value === "object") {
               return [
                  key,
                  serializeEntity(value as any).objectID
                     ? serializeEntity(value as any)
                     : value,
               ]
            }
            return [key, value]
         })
      ) as S

      return {
         ...serialized,
         objectID: entity.id,
      }
   }

   const serializedHits = entities.map(serializeEntity)

   const response: SearchResponse<S> & { deserializedHits: D[] } = {
      hits: serializedHits,
      deserializedHits: entities.map((entity) => ({
         ...entity,
         objectID: entity.id,
      })) as unknown as D[],
      page: 0,
      nbHits: entities.length,
      nbPages: 1,
      hitsPerPage: entities.length,
      processingTimeMS: 0,
      exhaustiveNbHits: true,
      query: "",
      params: "",
   }

   return [response]
}
