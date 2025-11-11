import { BUNDLE_NAMES, BundleName } from "@careerfairy/shared-lib/functions"
import { getEarliestEventBufferTime } from "@careerfairy/shared-lib/livestreams"
import { DateTime } from "luxon"
import { Bundle } from "./lib/bundleGenerator"

/**
 * Each bundle in this array will be a separate function named:
 * bundle-${bundle.name}
 *
 * Important:
 * For each entry, make sure you create the required Firebase hosting
 * mapping in firebase.json, this is required to cache the bundle response
 * and for it to be available behind the CDN.
 *
 * You'll need to deploy both the new function, and the new hosting config.
 */
export const bundles = {
   [BUNDLE_NAMES.allFutureLivestreams]: {
      name: BUNDLE_NAMES.allFutureLivestreams,
      cacheControl: "public, max-age=900", // 15min
      queries: {
         "future-livestreams-query": (firestore) =>
            firestore
               .collection("livestreams")
               .where("start", ">", getEarliestEventBufferTime())
               .where("test", "==", false)
               .where("livestreamType", "==", "livestream")
               .where("hidden", "==", false),
      },
   },
   [BUNDLE_NAMES.futureLivestreamsNext15Days]: {
      name: BUNDLE_NAMES.futureLivestreamsNext15Days,
      cacheControl: "public, max-age=900", // 15min
      queries: {
         "future-livestreams-query": (firestore) =>
            firestore
               .collection("livestreams")
               .where("start", ">", getEarliestEventBufferTime())
               .where(
                  "start",
                  "<",
                  DateTime.local().plus({ days: 15 }).toJSDate()
               )
               .where("test", "==", false)
               .where("livestreamType", "==", "livestream")
               .where("hidden", "==", false),
      },
   },

   // Warning: may take ~20s to generate when not cached
   [BUNDLE_NAMES.pastYearLivestreams]: {
      name: BUNDLE_NAMES.pastYearLivestreams,
      cacheControl: "public, max-age=86400", // 1 day, this list is big
      queries: {
         "past-livestreams-query": (firestore) =>
            firestore
               .collection("livestreams")
               .where(
                  "start",
                  ">",
                  DateTime.local().minus({ year: 1 }).toJSDate()
               )
               .where("start", "<", new Date())
               .where("test", "==", false)
               .where("livestreamType", "==", "livestream")
               .where("hidden", "==", false),
      },
   },
   [BUNDLE_NAMES.allSparksStats]: {
      name: BUNDLE_NAMES.allSparksStats,
      cacheControl: "public, max-age=900", // 15min
      queries: {
         "all-sparks-stats": (firestore) =>
            firestore
               .collection("sparkStats")
               .where("spark.published", "==", true)
               .where("spark.group.publicSparks", "==", true)
               .where("deleted", "==", false),
      },
   },
   [BUNDLE_NAMES.allFutureOfflineEvents]: {
      name: BUNDLE_NAMES.allFutureOfflineEvents,
      cacheControl: "public, max-age=900", // 15min
      queries: {
         "future-offline-events-query": (firestore) =>
            firestore
               .collection("offlineEvents")
               .where("hidden", "==", false)
               .where("published", "==", true)
               // Include events from today onwards (start of today) so events happening today are still shown
               .where(
                  "startAt",
                  ">",
                  DateTime.local().startOf("day").toJSDate()
               ),
      },
   },
} satisfies Record<BundleName, Bundle>
