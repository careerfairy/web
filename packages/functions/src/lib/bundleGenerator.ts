import config from "../config"
import * as functions from "firebase-functions"
import { firestore } from "../api/firestoreAdmin"

export type BundleQueryFetcher = (
   firestore: FirebaseFirestore.Firestore
) => FirebaseFirestore.Query

export type Bundle = {
   /**
    * Function & Bundle name
    */
   name: string

   /**
    * Cache-Control header value for the bundle
    * see https://firebase.google.com/docs/hosting/manage-cache
    */
   cacheControl: string

   /**
    * Queries to fetch data for the bundle
    */
   queries: Record<string, BundleQueryFetcher>
}

/**
 * Generates a set of functions that will generate a bundle
 */
export function generateFunctionsFromBundles(bundles: Record<string, Bundle>) {
   const exports = {}

   for (const bundleName in bundles) {
      const bundle = bundles[bundleName]

      exports[bundleName] = functions
         .region(config.region)
         .runWith({
            // big bundles, require more memory to generate them faster
            memory: "512MB",
         })
         .https.onRequest(async (_, res) => {
            // Build the bundle from the query results
            const bundleCreator = firestore.bundle(bundleName)

            // fetch the data queries in parallel
            const queriesPromises = Object.keys(bundle.queries).map(
               (queryName) => {
                  return bundle.queries[queryName](firestore).get()
               }
            )

            const data = await Promise.all(queriesPromises)

            // add the data to the bundle
            Object.keys(bundle.queries).forEach((queryName, index) => {
               bundleCreator.add(queryName, data[index])
            })

            res.set("Cache-Control", bundle.cacheControl)

            res.end(bundleCreator.build())
         })
   }

   return exports
}
