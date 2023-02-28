import { Timestamp } from "../firebaseTypes"

export type CacheKey = {
   plain: string
   hashed: string
}

export const generateCacheKey = async (
   values: any[],
   hashFn: (str: string) => string | Promise<string>
): Promise<CacheKey> => {
   const serialized = JSON.stringify(values)

   return {
      plain: serialized,
      hashed: await Promise.resolve(hashFn(serialized)),
   }
}

export interface CacheEntryDocument {
   /** Hashed Cache key - will be the same as the document id */
   key: string
   /** Key before being hashed, might be useful for some debugging */
   plainKey: string
   /** Time data was cached, as a Cloud Firestore Timestamp object */
   cachedAt: Timestamp
   /** Time data should no longer be considered fresh, as a Cloud Firestore Timestamp object */
   expiresAt: Timestamp
   /** gzipped data stored as bytes */
   data: Uint8Array
}
