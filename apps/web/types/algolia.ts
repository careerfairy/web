import { Hit } from "@algolia/client-search"
import {
   CompanyFieldToIndexType,
   TransformedGroup,
} from "@careerfairy/shared-lib/groups/search"
import {
   FieldToIndexType,
   TransformedLivestreamEvent,
} from "@careerfairy/shared-lib/livestreams/search"

import {
   CustomJobFieldToIndexType,
   TransformedCustomJob,
} from "@careerfairy/shared-lib/customJobs/search"

import {
   FieldToIndexType as SparkFieldToIndexType,
   TransformedSpark,
} from "@careerfairy/shared-lib/sparks/search"
import firebase from "firebase/compat/app"

/**
 * Transforms `firebase.firestore.Timestamp` properties in type `T` to a format
 * `{ seconds: number; nanoseconds: number }` as Algolia automatically
 * serializes these objects on the backend. This conversion is applied recursively to ensure
 * all nested Timestamps are also serialized, making the data compatible for
 * indexing in Algolia.
 *
 * @template T - The type to transform for Algolia serialization.
 */
export type SerializeTimestamps<T> = {
   [P in keyof T]: T[P] extends firebase.firestore.Timestamp
      ? { _seconds: number; _nanoseconds: number }
      : T[P] extends object
      ? SerializeTimestamps<T[P]>
      : T[P]
}

export type DeserializeTimestamps<T> = {
   [P in keyof T]: T[P] extends { _seconds: number; _nanoseconds: number }
      ? firebase.firestore.Timestamp
      : T[P] extends object
      ? DeserializeTimestamps<T[P]>
      : T[P]
}

// The livestream data type stored in the Algolia index.
export type AlgoliaLivestreamResponse = SerializeTimestamps<
   Pick<TransformedLivestreamEvent, FieldToIndexType>
>

// The data type with additional Algolia metadata like `objectID`, '_highlightResult', '_rankingInfo' etc.
export type LivestreamAlgoliaHit = Hit<AlgoliaLivestreamResponse>

// The search result type with deserialized timestamps.
export type LivestreamSearchResult = DeserializeTimestamps<LivestreamAlgoliaHit>

// The spark data type stored in the Algolia index.
export type AlgoliaSparkResponse = SerializeTimestamps<
   Pick<TransformedSpark, SparkFieldToIndexType>
>

export type SparkAlgoliaHit = Hit<AlgoliaSparkResponse>

// The search result type with deserialized timestamps.
export type SparkSearchResult = DeserializeTimestamps<SparkAlgoliaHit>

// The company data type stored in the Algolia index.
export type AlgoliaCompanyResponse = SerializeTimestamps<
   Pick<TransformedGroup, CompanyFieldToIndexType>
>

// The data type with additional Algolia metadata like `objectID`, '_highlightResult', '_rankingInfo' etc.
export type CompanyAlgoliaHit = Hit<AlgoliaCompanyResponse>

// The search result type with deserialized timestamps.
export type CompanySearchResult = DeserializeTimestamps<CompanyAlgoliaHit>

export type AlgoliaCustomJobResponse = SerializeTimestamps<
   Pick<TransformedCustomJob, CustomJobFieldToIndexType>
>

export type CustomJobAlgoliaHit = Hit<AlgoliaCustomJobResponse>

export type CustomJobSearchResult = DeserializeTimestamps<CustomJobAlgoliaHit>

// Filters
export type DateFilterFieldType<T> = {
   attribute: keyof T & (string | number)
   startDate: Date
   endDate: Date
}
