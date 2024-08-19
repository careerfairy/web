import firebase from "firebase/compat/app"
import { useEffect, useState } from "react"
import firestore = firebase.firestore

const useInfiniteScrollGet = <T>(query: firestore.Query, limit: number) => {
   const [isBottom, setIsBottom] = useState(false)
   const [loading, setLoading] = useState(false)
   const [loadingError, setLoadingError] = useState(null)
   const [loadingMore, setLoadingMore] = useState(false)
   const [loadingMoreError, setLoadingMoreError] = useState(null)
   const [nextKey, setNextKey] = useState<firestore.DocumentSnapshot>(null)
   const [items, setItems] = useState<T[]>([])
   const [hasMore, setHasMore] = useState(true)

   useEffect(() => {
      const handleFirstBatch = async () => {
         await firstBatch()
      }
      handleFirstBatch()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [query])

   useEffect(() => {
      const handleScroll = () => {
         const { scrollTop, scrollHeight, clientHeight } =
            document.documentElement
         if (scrollTop + clientHeight >= scrollHeight - 300) {
            setIsBottom(true)
         } else {
            setIsBottom(false)
         }
      }
      handleScroll()
      window.addEventListener("scroll", handleScroll)
      return () => {
         window.removeEventListener("scroll", handleScroll)
      }
   }, [query])

   useEffect(() => {
      if (isBottom && hasMore && !loadingMore && nextKey) {
         const handleNextBatch = async () => {
            await nextBatch(nextKey)
         }
         handleNextBatch()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isBottom, hasMore, loadingMore, nextKey])

   /**
    * this function will be fired when the app is first time run,
    * and it will fetch first 5 posts, here i retrieve them in desc order,
    * until show last added post first.
    */
   const firstBatch = async () => {
      console.log("-> load")
      try {
         setLoading(true)
         setLoadingError(null)
         const snaps = await query.limit(limit + 1).get()
         const docs = [...snaps.docs]
         const hasMore = snaps.size > limit
         const latestKey = snaps.docs[snaps.docs.length - 1]
         // @ts-ignore
         const data = docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
         })) as T[]

         setNextKey(latestKey)
         setItems(data)
         setHasMore(hasMore)
      } catch (e) {
         setLoadingError(e)
      } finally {
         setLoading(false)
      }
   }

   const nextBatch = async (key: firestore.DocumentSnapshot) => {
      try {
         console.log("-> next", key.id)
         setLoadingMore(true)
         setLoadingMoreError(null)
         const snaps = await query
            .startAfter(key)
            .limit(limit + 1)
            .get()
         const hasMore = snaps.size > limit
         const docs = [...snaps.docs]
         const latestKey = snaps.docs[snaps.docs.length - 1]

         // @ts-ignore
         const data = docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
         })) as T[]
         setNextKey(latestKey)
         setItems((prevData) => [...prevData, ...data])
         setHasMore(hasMore)
      } catch (e) {
         setLoadingMoreError(e)
      } finally {
         setLoadingMore(false)
      }
   }

   return {
      loading,
      loadingError,
      loadingMore,
      loadingMoreError,
      hasMore,
      data: items as T[],
   }
}

export default useInfiniteScrollGet
