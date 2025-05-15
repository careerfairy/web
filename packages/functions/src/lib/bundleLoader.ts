import axios, { AxiosInstance } from "axios"
import {
   getDocs,
   getDocsFromCache,
   loadBundle,
   namedQuery,
} from "firebase/firestore"
import { firestoreClientSDK } from "../api/firestoreClient"
import { BundleName } from "../bundles"
import config from "../config"
import { isTestEnvironment, logAxiosErrorAndThrow } from "../util"

type BundleLoaderOptions = {
   url?: string
}

/**
 * Knows how to load a bundle from the hosting server
 *
 * Locally will call the function directly, in production
 * will call the CDN
 */
export class BundleLoader {
   private axios: AxiosInstance
   private url: string

   constructor(options: BundleLoaderOptions = {}) {
      this.url = options.url ?? config.hostingUrl

      this.axios = axios.create({
         baseURL: this.url,
      })
   }

   /**
    * Downloads the bundle data and loads it
    * into the firestore cache
    */
   async fetch(name: BundleName) {
      const bundleData = await this.fetchHTTPBundle(name)

      // loads the data into firestore cache / memory
      await loadBundle(firestoreClientSDK, bundleData)
   }

   /**
    * Retrieves the documents inside a query
    */
   async getDocs<T>(queryName: string) {
      try {
         const query = await namedQuery(firestoreClientSDK, queryName)

         /**
          * In test environments, we use getDocs instead of getDocsFromCache because:
          * 1. Test data changes rapidly as tests run in parallel
          * 2. Tests frequently wipe/reset the database
          * 3. The Firestore bundle cache cannot reliably stay in sync with these rapid changes
          * 4. It's more reliable to fetch directly from the database in test contexts
          */
         const queryExecutor = isTestEnvironment() ? getDocs : getDocsFromCache

         return queryExecutor(query).then((docs) =>
            docs.docs.map(
               (doc) =>
                  ({
                     ...doc.data(),
                     id: doc.id,
                  } as T)
            )
         )
      } catch (error) {
         console.error(
            `Error loading the named query "${queryName}" from Firestore`
         )
         throw error
      }
   }

   private async fetchHTTPBundle(name: BundleName): Promise<string> {
      try {
         const { data } = await this.axios.get<string>(`/bundle-${name}`)

         return data
      } catch (error) {
         throw logAxiosErrorAndThrow(
            "Failed to http fetch the bundle",
            error,
            name
         )
      }
   }
}
