import { generateCacheKey } from "@careerfairy/shared-lib/functions/cache"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { doc, getDoc } from "firebase/firestore"
import pako from "pako"
import { useEffect, useMemo, useState } from "react"
import { errorLogAndNotify, sha1 } from "util/CommonUtil"

/**
 * Optimistic fetch cached document while it revalidates the data in the background
 * through a function call
 *
 * Useful when the function is slow and we want to improve the UX by showing old
 * data first
 */
const useStaleWhileRevalidate = <T,>(
   cacheNamespace: string,
   cacheKeyValues: unknown[],
   functionCall?: () => Promise<T>
) => {
   // cached or fn data
   const [fetchedCacheResult, setFetchedCacheResult] = useState<T>(undefined) // undefined => loading
   const [fetchedFnResult, setFetchedFnResult] = useState<T>(undefined) // undefined => loading

   useEffect(() => {
      let mounted = true

      function updateCached(data: T) {
         if (mounted) {
            setFetchedCacheResult(data)
         }
      }

      function updateFinal(data: T) {
         if (mounted) {
            setFetchedFnResult(data)
         }
      }

      readCacheDoc(cacheNamespace, cacheKeyValues)
         .then((r) => {
            updateCached(r)
         })
         .catch((e) => {
            errorLogAndNotify(e)
            updateCached(null)
         })

      functionCall?.()
         .then((r) => {
            updateFinal(r)
         })
         .catch((e) => {
            errorLogAndNotify(e)
            updateFinal(null)
         })

      return () => {
         mounted = false
      }
   }, [cacheNamespace, cacheKeyValues, functionCall])

   const values = useMemo(
      () => ({
         /**
          * cached or final data
          */
         data: fetchedFnResult ?? fetchedCacheResult,
         /**
          * cached data is loading
          */
         loading: fetchedCacheResult === undefined,
         /**
          * data value is from cache
          */
         cached:
            fetchedCacheResult !== undefined && fetchedFnResult === undefined,
         /**
          * function call is complete
          */
         finished: fetchedFnResult !== undefined,
      }),
      [fetchedCacheResult, fetchedFnResult]
   )

   return values
}

/**
 * Fetch the cached document and decompresses it's contents
 */
async function readCacheDoc(cacheNamespace: string, cacheKeyValues: unknown[]) {
   const cacheKey = await generateCacheKey(cacheKeyValues, sha1)

   const docRef = doc(
      FirestoreInstance,
      "cache",
      "functions",
      cacheNamespace,
      cacheKey.hashed
   )

   const docSnap = await getDoc(docRef)

   if (docSnap.exists()) {
      const decompressed = ungzip(docSnap.data().data.toUint8Array())

      return JSON.parse(decompressed)
   } else {
      return null
   }
}

function ungzip(data: Uint8Array): string {
   return pako.inflate(data, { to: "string" })
}

export default useStaleWhileRevalidate
