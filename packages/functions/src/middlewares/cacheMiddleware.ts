import { admin } from "../api/firestoreAdmin"
import { https } from "firebase-functions"
import { Middleware } from "./middlewares"
import * as crypto from "crypto"

interface CacheEntryDocument {
   /** Hashed Cache key - will be the same as the document id */
   key: string
   /** Key before being hashed, might be useful for some debugging */
   plainKey: string
   /** Time data was cached, as a Cloud Firestore Timestamp object */
   cachedAt: admin.firestore.Timestamp
   /** Time data should no longer be considered fresh, as a Cloud Firestore Timestamp object */
   expiresAt: admin.firestore.Timestamp
   /** The cached resource serialized via JSON.stringify */
   data: string
   // doesn't have ETag info yet because firebase callable functions don't support setting response headers
}

/**
 * Function to extract the cacheOnCallValues key from the request data/context
 *
 * Should return an array of values
 *  e.g ["getJob", 123]
 *
 * This array will be concatenated and used as cacheOnCallValues key
 */
export type CacheKeyOnCallFn = (
   data: any,
   context: https.CallableContext
) => any[]

/**
 * Cache Middleware for onCall functions
 * Stores the next() middleware result in firestore
 *
 * Cache documents will be stored under cacheOnCallValues/$cacheNameSpace
 *
 * @param cacheNameSpace
 * @param cacheKeyFn
 * @param ttlSeconds
 */
export const cacheOnCallValues = (
   cacheNameSpace: string,
   cacheKeyFn: CacheKeyOnCallFn,
   ttlSeconds: number
): Middleware => {
   return async (data, context, next) => {
      const cacheKey = generateCacheKey(cacheKeyFn(data, context))

      // Try to fetch from cacheOnCallValues
      const cachedDocument = await getFirestoreCacheDocument(
         cacheNameSpace,
         cacheKey.hashed
      )

      // cacheOnCallValues exists and is not expired (still valid)
      if (cachedDocument && isCacheEntryValid(cachedDocument)) {
         // response headers for us to easily identify cached responses
         context.rawRequest.res?.header(
            "X-Cache-Expires",
            cachedDocument.expiresAt.toDate().toISOString()
         )
         context.rawRequest.res?.header(
            "X-Cached-At",
            cachedDocument.cachedAt.toDate().toISOString()
         )

         return JSON.parse(cachedDocument.data)
      }

      // no cacheOnCallValues, calculate the result
      const value = await next()

      // cacheOnCallValues the result
      const cacheEntry = createCacheEntry(cacheKey, value, ttlSeconds)
      await upsertFirestoreCacheDocument(
         cacheNameSpace,
         cacheKey.hashed,
         cacheEntry
      )

      return value
   }
}

/*
|--------------------------------------------------------------------------
| Firestore CRUD
|--------------------------------------------------------------------------
*/
const getFirestoreCacheDocument = async (
   cacheNamespace: string,
   documentId: string
): Promise<CacheEntryDocument> => {
   const documentSnap = await admin
      .firestore()
      .collection(`cache/functions/${cacheNamespace}`)
      .doc(documentId)
      .get()

   if (!documentSnap.exists) {
      return null
   }

   return documentSnap.data() as CacheEntryDocument
}

const upsertFirestoreCacheDocument = async (
   cacheNamespace: string,
   documentId: string,
   cacheEntry: CacheEntryDocument
): Promise<void> => {
   const documentSnap = await admin
      .firestore()
      .collection(`cache/functions/${cacheNamespace}`)
      .doc(documentId)

   await documentSnap.set(cacheEntry)
}

/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/
const createCacheEntry = (
   cacheKey: CacheKey,
   value: any,
   ttlSeconds: number
): CacheEntryDocument => {
   const ttlMs = ttlSeconds * 1000
   return {
      key: cacheKey.hashed,
      plainKey: cacheKey.plain,
      cachedAt: admin.firestore.Timestamp.now(),
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + ttlMs),
      data: JSON.stringify(value),
   }
}

const isCacheEntryValid = (entry: CacheEntryDocument): boolean => {
   const expiresAt = entry.expiresAt.toMillis()

   return expiresAt > Date.now()
}

type CacheKey = {
   plain: string
   hashed: string
}

const generateCacheKey = (values: any[]): CacheKey => {
   const serialized = JSON.stringify(values)

   return {
      plain: serialized,
      hashed: hash(serialized),
   }
}

/**
 * Deterministic Hash the input string
 *
 * Using sha1 because it has fewer collisions' probability than md5
 *  md5 would also work fine here
 *
 * We only care about hashing speed and collisions here, not security
 * @param input
 */
const hash = (input: string) =>
   crypto.createHash("sha1").update(input).digest("hex")
