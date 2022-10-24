import * as BusinessModels from "./BusinessModels"

const hash = require("object-hash")
import firebase from "firebase/compat"
import { MergeATSRepository } from "./MergeATSRepository"

type BusinessModel =
   | BusinessModels.Job
   | BusinessModels.Candidate
   | BusinessModels.Office
   | BusinessModels.Recruiter
   | BusinessModels.Department
   | BusinessModels.SyncStatus
   | BusinessModels.Application

interface CacheEntry<T = firebase.firestore.DocumentData> {
   hashAccountToken: string
   /** The name of the class constructor that this entry is for it will be used to parse the data */
   constructorName: string
   /** Time data was cached, as a Cloud Firestore Timestamp object */
   cachedAt: firebase.firestore.Timestamp
   /** Time data should no longer be considered fresh, as a Cloud Firestore Timestamp object */
   expiresAt: firebase.firestore.Timestamp
   /** The ETag signature of the cached resource */
   // eTag: string
   /** The cached resource */
   data: T | T[]
}

/**
 * Firebase cache decorator
 * @param TTL  The time to live for the cache entry in milliseconds default is 1 hour
 */
export function fromFirebaseCache(TTL: number = 3600000) {
   return function (
      constructor: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
   ) {
      const originalMethod = descriptor.value
      descriptor.value = async function (...args: any[]) {
         const token = this.axios.defaults.headers.common["X-Account-Token"]
         const firestore: typeof firebase.firestore = this.firestore
         if (!firestore) {
            throw new Error("@fromFirebaseCache decorator needs firestore")
         }

         if (!token) {
            throw new Error(
               `@fromFirebaseCache can only be applied to methods that require an account token`
            )
         }
         const hashAccountToken = hash(token)
         const cacheKey = getCacheKey(propertyKey, args, hashAccountToken)
         const cacheRef = firestore()
            .collection("cache")
            .doc("merge")
            .collection(`${propertyKey}`)
            .doc(cacheKey)
         const cachedResultSnap = await cacheRef.get()

         if (cachedResultSnap.exists) {
            // get the expiresAt property on it's own
            // this allows us to skip processing the entire document until needed
            const expiresAt = cachedResultSnap.get("expiresAt") as
               | CacheEntry["expiresAt"]
               | undefined

            let expired = expiresAt?.toMillis() < Date.now()

            if (expiresAt && !expired) {
               // return the entire cache entry as-is
               const cachedEntry = cachedResultSnap.data() as CacheEntry
               let resultFromCache: BusinessModel | BusinessModel[] = null

               if (Array.isArray(cachedEntry.data)) {
                  resultFromCache = cachedEntry.data.map((data: any) =>
                     BusinessModels[
                        cachedEntry.constructorName
                     ].createFromPlainObject(data)
                  )
               } else if (cachedEntry.data) {
                  resultFromCache = BusinessModels[
                     cachedEntry.constructorName
                  ].createFromPlainObject(cachedEntry.data)
               }
               return resultFromCache
            } else {
               // delete the expired cache entry
               cacheRef.delete().catch(console.error)
            }
         }
         // if here, the cache entry doesn't exist or has expired

         // Use the original method to get the live results directly from Merge
         const result: BusinessModel | BusinessModel[] =
            await originalMethod.apply(this, args)

         let cacheEntry: CacheEntry
         // create a cache entry for the result
         if (Array.isArray(result)) {
            cacheEntry = createCacheEntry(
               hashAccountToken,
               // @ts-ignore
               result.map(
                  (data) => data.serializeToPlainObject() as CacheEntry["data"]
               ),
               result?.[0]?.constructor?.name || "",
               firestore,
               TTL
            )
         } else {
            cacheEntry = createCacheEntry(
               hashAccountToken,
               // @ts-ignore
               (result?.serializeToPlainObject() as CacheEntry["data"]) || null,
               result?.constructor?.name || "",
               firestore,
               TTL
            )
         }

         // save the cache entry to Firestore
         await firestore()
            .collection("cache")
            .doc("merge")
            .collection(`${propertyKey}`)
            .doc(cacheKey)
            .set(cacheEntry)

         return result // return the live results from merge
      }
   }
}

const createCacheEntry = <T>(
   hashAccountToken: string,
   data: T | T[],
   constructorName: string,
   firestore: typeof firebase.firestore,
   TTL: number
): CacheEntry<T> => {
   // etag, cachedAt and expiresAt are used for the HTTP cache-related headers
   // only expiresAt is used when determining expiry
   // timestamp.
   return {
      hashAccountToken: hashAccountToken,
      data: data,
      // eTag: hash(data),
      cachedAt: firestore.Timestamp.now(),
      expiresAt: firestore.Timestamp.fromMillis(Date.now() + TTL),
      constructorName: constructorName,
   }
}

// clear the cache for a given propertyKey
async function clearCache(
   firestore: typeof firebase.firestore,
   propertyKey: string,
   hashAccountToken: string
) {
   await firestore()
      .collection("cache")
      .doc("merge")
      .collection(`${propertyKey}`)
      .where("hashAccountToken", "==", hashAccountToken)
      .get()
      .then((querySnapshot) => {
         const promises = []
         querySnapshot.forEach((doc) => {
            promises.push(doc.ref.delete())
         })
         return Promise.allSettled(promises)
      })
      .catch(console.error)
}

/**
 * Firebase cache decorator
 * @param targetPropertyKeys The name of the methods in the Merge ATS repository, of which you want their cached results to be purged
 */
export function clearFirebaseCache(
   targetPropertyKeys: (keyof MergeATSRepository)[]
) {
   return function (
      constructor: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
   ) {
      const originalMethod = descriptor.value
      descriptor.value = async function (...args: any[]) {
         const token = this.axios.defaults.headers.common["X-Account-Token"]
         const firestore: typeof firebase.firestore = this.firestore

         if (!firestore) {
            throw new Error("firestore is not defined")
         }
         const hashAccountToken = hash(token)

         const promises = targetPropertyKeys.map((key) =>
            clearCache(firestore, key, hashAccountToken)
         )
         Promise.allSettled(promises).catch(console.error)

         return originalMethod.apply(this, args)
      }
   }
}

const getCacheKey = (
   propertyKey: string,
   args: any,
   hashAccountToken: string
): string => {
   return [`${propertyKey}`, ...(args || []), `${hashAccountToken}`].join("_") // join with underscore to make it easier to search for cache entries
}
