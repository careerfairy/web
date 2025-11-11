import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   BUNDLE_CONFIG,
   BundleElementType,
   BundleName,
   BundleReturnType,
} from "@careerfairy/shared-lib/functions"
import {
   getDocs,
   getDocsFromCache,
   loadBundle,
   namedQuery,
} from "firebase/firestore"
import { getHostingUrl, isTestEnvironment } from "util/CommonUtil"
import { FirestoreInstance } from "../firebase/FirebaseInstance"

/**
 * Service for loading and querying Firebase bundles
 * Provides type-safe access to cached Firestore queries via CDN-hosted bundles
 *
 * @example
 * ```typescript
 * // Load offline events bundle and get data
 * const events = await bundleService.loadAndQuery(
 *   BUNDLE_NAMES.allFutureOfflineEvents
 * )
 * // TypeScript knows events is OfflineEvent[]
 * ```
 */
export class BundleService {
   private readonly baseUrl: string

   constructor() {
      this.baseUrl = getHostingUrl()
   }

   /**
    * Loads a bundle and executes its named query in one operation
    * Returns properly typed data based on the bundle name
    *
    * @param bundleName - The bundle to load (from BUNDLE_NAMES)
    * @returns Typed array of documents from the bundle
    * @throws Error if bundle fetch fails or named query not found
    */
   async loadAndQuery<T extends BundleName>(
      bundleName: T
   ): Promise<BundleReturnType<T>> {
      const config = BUNDLE_CONFIG[bundleName]
      if (!config) {
         throw new Error(`Unknown bundle: ${bundleName}`)
      }

      // Load bundle from CDN
      await this.loadBundle(bundleName)

      // Execute named query from bundle cache
      const namedQueryRef = await namedQuery(
         FirestoreInstance,
         config.queryName
      )

      if (!namedQueryRef) {
         throw new Error(
            `Named query '${config.queryName}' not found in bundle '${bundleName}'`
         )
      }

      console.log(`📦 Fetching data from bundle cache: ${bundleName}`)

      // Use getDocs in test environment, getDocsFromCache in production
      const queryExecutor = isTestEnvironment() ? getDocs : getDocsFromCache

      type ElementType = BundleElementType<T>

      const snapshot = await queryExecutor(
         namedQueryRef.withConverter(createGenericConverter<ElementType>())
      )

      const data = snapshot.docs.map((doc) => doc.data())

      console.log(`✅ Retrieved ${data.length} documents from bundle cache`)

      return data
   }

   /**
    * Loads a bundle into Firestore cache
    * Fetches from CDN with caching headers (15min - 1 day TTL)
    *
    * @param bundleName - The bundle to load
    * @throws Error if bundle fetch fails
    */
   private async loadBundle(bundleName: BundleName): Promise<void> {
      const bundleUrl = `${this.baseUrl}/bundle-${bundleName}`

      console.log(`📦 Loading bundle from: ${bundleUrl}`)

      const response = await fetch(bundleUrl)
      if (!response.ok) {
         throw new Error(
            `Bundle fetch failed with status ${response.status}: ${bundleUrl}`
         )
      }

      const bundleData = await response.text()
      await loadBundle(FirestoreInstance, bundleData)

      console.log(`✅ Bundle loaded successfully: ${bundleName}`)
   }
}

/**
 * Singleton instance for bundle operations
 * Use this throughout the application for consistent bundle loading
 */
export const bundleService = new BundleService()

export default bundleService
