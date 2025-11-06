import { LivestreamEvent } from "../livestreams"
import { OfflineEvent } from "../offline-events/offline-events"
import { SparkStats } from "../sparks/sparks"
import { BUNDLE_NAMES, BundleName } from "./functionNames"

/**
 * Type-safe configuration for Firebase bundles
 * Maps bundle names to their named query names and return types
 */
export interface BundleConfig {
   /**
    * The bundle name (matches BUNDLE_NAMES)
    */
   name: BundleName
   /**
    * The named query identifier in the bundle
    */
   queryName: string
}

/**
 * Type-safe bundle configuration mapping
 * Ensures compile-time safety when loading bundles
 */
export const BUNDLE_CONFIG: Record<BundleName, BundleConfig> = {
   [BUNDLE_NAMES.allFutureLivestreams]: {
      name: BUNDLE_NAMES.allFutureLivestreams,
      queryName: "future-livestreams-query",
   },
   [BUNDLE_NAMES.futureLivestreamsNext15Days]: {
      name: BUNDLE_NAMES.futureLivestreamsNext15Days,
      queryName: "future-livestreams-query",
   },
   [BUNDLE_NAMES.pastYearLivestreams]: {
      name: BUNDLE_NAMES.pastYearLivestreams,
      queryName: "past-livestreams-query",
   },
   [BUNDLE_NAMES.allSparksStats]: {
      name: BUNDLE_NAMES.allSparksStats,
      queryName: "all-sparks-stats",
   },
   [BUNDLE_NAMES.allFutureOfflineEvents]: {
      name: BUNDLE_NAMES.allFutureOfflineEvents,
      queryName: "future-offline-events-query",
   },
} as const

/**
 * Helper type to extract element type from bundle name
 * Used for type-safe converter creation
 */
export type BundleElementType<T extends BundleName> =
   T extends typeof BUNDLE_NAMES.allFutureLivestreams
      ? LivestreamEvent
      : T extends typeof BUNDLE_NAMES.futureLivestreamsNext15Days
      ? LivestreamEvent
      : T extends typeof BUNDLE_NAMES.pastYearLivestreams
      ? LivestreamEvent
      : T extends typeof BUNDLE_NAMES.allSparksStats
      ? SparkStats
      : T extends typeof BUNDLE_NAMES.allFutureOfflineEvents
      ? OfflineEvent
      : never

/**
 * Type mapping for bundle return types
 * Enables type inference based on bundle name
 * Uses BundleElementType to ensure type consistency
 */
export type BundleReturnType<T extends BundleName> = BundleElementType<T>[]
