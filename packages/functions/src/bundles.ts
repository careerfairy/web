import { getEarliestEventBufferTime } from "@careerfairy/shared-lib/livestreams"
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
   allFutureLivestreams: {
      name: "allFutureLivestreams",
      cacheControl: "public, max-age=900", // 15min
      queries: {
         "future-livestreams-query": (firestore) =>
            firestore
               .collection("livestreams")
               .where("start", ">", getEarliestEventBufferTime())
               .where("test", "==", false),
      },
   },
} satisfies { [key: string]: Bundle }

export type BundleName = keyof typeof bundles
