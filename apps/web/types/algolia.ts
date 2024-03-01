import { Hit } from "@algolia/client-search"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LIVESTREAM_FIELDS_TO_INDEX } from "@careerfairy/shared-lib/livestreams/search"
import firebase from "firebase/compat/app"

type LiveStreamIndexKeysType = (typeof LIVESTREAM_FIELDS_TO_INDEX)[number]

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

export type AlgoliaSerializedLivestream = SerializeTimestamps<
   Pick<LivestreamEvent, LiveStreamIndexKeysType>
>

export type LivestreamAlgoliaHit = Hit<AlgoliaSerializedLivestream>

export type LivestreamSearchResult = DeserializeTimestamps<LivestreamAlgoliaHit>
