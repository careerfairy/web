import * as functions from "firebase-functions"
import { https } from "firebase-functions"
import { OnCallMiddleware } from "./middlewares"
import { compress, decompress, sha1 } from "../util"
import {
   CacheEntryDocument,
   CacheKey,
   generateCacheKey,
} from "@careerfairy/shared-lib/functions/cache"
import { firestore, Timestamp } from "../api/firestoreAdmin"

/**
 * Function to extract the cache key from the request data/context
 *
 * Should return an array of values
 *  e.g ["getJob", 123]
 *
 * This array will be concatenated and used as cache key
 */
export type CacheKeyOnCallFn = (
   data: any,
   context: https.CallableContext
) => any[]

/**
 * Cache Middleware for onCall functions
 * Stores the next() middleware result in firestore
 *
 * Cache documents will be stored under cache/functions/$cacheNameSpace
 *
 * @param cacheNameSpace
 * @param cacheKeyFn
 * @param ttlSeconds
 */
export const cacheOnCallValues = (
   cacheNameSpace: string,
   cacheKeyFn: CacheKeyOnCallFn,
   ttlSeconds: number
): OnCallMiddleware => {
   return async (data, context, next) => {
      const cacheKey = await generateCacheKey(cacheKeyFn(data, context), sha1)

      // Try to fetch from cache
      const cachedDocument = await getFirestoreCacheDocument(
         cacheNameSpace,
         cacheKey.hashed
      )

      // cache exists and is not expired (still valid)
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

         try {
            return getCacheEntryData(cachedDocument)
         } catch (e) {
            // log the error and let the middle continue to the real handler
            functions.logger.error(
               "Failed to get the cached document data",
               e,
               cachedDocument.plainKey
            )
         }
      }

      // no cache, calculate the result
      const value = await next()

      // cache the result
      let cacheEntry: CacheEntryDocument
      try {
         cacheEntry = await createCacheEntry(cacheKey, value, ttlSeconds)
         await upsertFirestoreCacheDocument(
            cacheNameSpace,
            cacheKey.hashed,
            cacheEntry
         )
      } catch (e) {
         // log the error and let the flow continue
         functions.logger.error(
            "Failed to created a cached document",
            e,
            cacheEntry?.plainKey
         )
      }

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
   const documentSnap = await firestore
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
   const documentSnap = await firestore
      .collection(`cache/functions/${cacheNamespace}`)
      .doc(documentId)

   await documentSnap.set(cacheEntry)
}

/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/
const createCacheEntry = async (
   cacheKey: CacheKey,
   value: any,
   ttlSeconds: number
): Promise<CacheEntryDocument> => {
   const ttlMs = ttlSeconds * 1000

   const serializedValue = JSON.stringify(value)
   const compressedBuffer = await compress(Buffer.from(serializedValue))

   return {
      key: cacheKey.hashed,
      plainKey: cacheKey.plain,
      cachedAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + ttlMs),
      data: compressedBuffer,
   }
}

const getCacheEntryData = (entry: CacheEntryDocument): Promise<any> => {
   return decompress(entry.data).then((buffer) => JSON.parse(buffer.toString()))
}

const isCacheEntryValid = (entry: CacheEntryDocument): boolean => {
   const expiresAt = entry.expiresAt.toMillis()

   return expiresAt > Date.now()
}
