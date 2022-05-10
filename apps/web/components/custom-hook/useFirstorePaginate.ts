import { useState } from "react"
import firebase from "firebase"
import firestore = firebase.firestore

const useFirestorePaginate = <T>(query: firestore.Query, limit: number) => {
   const [loading, setLoading] = useState(false)
   const [loadingError, setLoadingError] = useState(null)
   const [loadingMore, setLoadingMore] = useState(false)
   const [loadingMoreError, setLoadingMoreError] = useState(null)
   const [nextKey, setNextKey] = useState<firestore.DocumentSnapshot>(null)
   const [items, setItems] = useState<T[]>([])
   const [hasMore, setHasMore] = useState(true)
   console.log("-> hasMore", hasMore)

   const next = async () => {
      console.log("-> next")
      const key = nextKey
      try {
         let snaps
         if (key) {
            setLoadingMore(true)
            setLoadingMoreError(null)
            snaps = await query
               .startAfter(key)
               .limit(limit + 1)
               .get()
         } else {
            setLoading(true)
            setLoadingError(null)
            snaps = await query.limit(limit + 1).get()
         }
         const hasMore = snaps.size > limit
         const docs = [...snaps.docs]
         const latestKey = hasMore ? docs.pop() : docs[docs.length - 1]

         // @ts-ignore
         const data = docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
         })) as T[]
         setNextKey(latestKey)
         setItems(data)
         setHasMore(hasMore)
      } catch (e) {
         if (key) {
            setLoadingMoreError(e)
         } else {
            setLoadingError(e)
         }
      } finally {
         if (key) {
            setLoadingMore(false)
         } else {
            setLoading(false)
         }
      }
   }

   return {
      loading,
      loadingError,
      loadingMore,
      loadingMoreError,
      hasMore,
      next,
      data: items as T[],
   }
}

export default useFirestorePaginate
