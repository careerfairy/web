import * as Classes from "./Classes"
var hash = require("object-hash")
import firebase from "firebase/compat"

type BusinessModel =
   | Classes.Job
   | Classes.Candidate
   | Classes.Office
   | Classes.Recruiter
   | Classes.Department
   | Classes.SyncStatus
   | Classes.Application

interface CacheEntry<T = firebase.firestore.DocumentData> {
   /** The name of the class constructor that this entry is for it will be used to parse the data */
   constructorName: string
   /** Time data was cached, as a Cloud Firestore Timestamp object */
   cachedAt: firebase.firestore.Timestamp
   /** Time data was cached, as a Cloud Firestore Timestamp object */
   expiresAt: firebase.firestore.Timestamp
   /** The ETag signature of the cached resource */
   eTag: string
   /** The cached resource */
   data: T | T[]
}

export function fromFirebaseCache() {
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
         const createCacheEntry = <T>(
            data: T | T[],
            constructorName: string
         ): CacheEntry<T> => {
            // etag, cachedAt and expiresAt are used for the HTTP cache-related headers
            // only expiresAt is used when determining expiry
            return {
               data: data,
               eTag: hash(data),
               cachedAt: firestore.Timestamp.now(),
               // set expiry as 1 day from now
               expiresAt: firestore.Timestamp.fromMillis(Date.now() + 86400000),
               constructorName: constructorName,
            }
         }
         if (!token) {
            throw new Error(
               `@fromCache can only be applied to methods that require an account token`
            )
         }
         const hashAccountToken = hash(token)
         const cacheKey = `${propertyKey}_${args.join("_")}_${hashAccountToken}`
         const cachedResultSnap = await firestore()
            .collection("cache")
            .doc("merge")
            .collection(`${propertyKey}`)
            .doc(cacheKey)
            .get()

         if (cachedResultSnap.exists) {
            // get the expiresAt property on it's own
            // this allows us to skip processing the entire document until needed
            const expiresAt = cachedResultSnap.get("expiresAt") as
               | CacheEntry["expiresAt"]
               | undefined
            if (
               expiresAt !== undefined &&
               expiresAt.toMillis() > Date.now() - 60000
            ) {
               // return the entire cache entry as-is
               const cachedEntry = cachedResultSnap.data() as CacheEntry
               let resultFromCache: BusinessModel | BusinessModel[]
               if (Array.isArray(cachedEntry.data)) {
                  resultFromCache = cachedEntry.data.map((data: any) =>
                     Classes[cachedEntry.constructorName].createFromPlainObject(
                        data
                     )
                  )
               } else {
                  resultFromCache = Classes[
                     cachedEntry.constructorName
                  ].createFromPlainObject(cachedEntry.data)
               }
               return resultFromCache
            }
         }
         console.log("-> DID NOT FIND IN CACHE")
         // if here, the cache entry doesn't exist or has expired

         // get the live results from Merge
         const result: BusinessModel | BusinessModel[] =
            await originalMethod.apply(this, args)
         let cacheEntry: CacheEntry
         // create a cache entry for the result
         if (Array.isArray(result)) {
            cacheEntry = createCacheEntry(
               // @ts-ignore
               result.map(
                  (data) => data.serializeToPlainObject() as CacheEntry["data"]
               ),
               result[0].constructor.name
            )
         } else {
            cacheEntry = createCacheEntry(
               // @ts-ignore
               result.serializeToPlainObject() as CacheEntry["data"],
               result.constructor.name
            )
         }
         // save the cache entry to Firestore
         await firestore()
            .collection("cache")
            .doc("merge")
            .collection(`${propertyKey}`)
            .doc(cacheKey)
            .set(cacheEntry)
         return result
      }
   }
}
