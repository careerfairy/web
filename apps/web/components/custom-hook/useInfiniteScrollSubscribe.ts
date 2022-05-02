import React, { useEffect, useState } from "react"
import useFirestorePagination from "./useFirestorePagination"
import firebase from "firebase"
import firestore = firebase.firestore

const useInfiniteScrollSubscribe = <T>(
   query: firestore.Query,
   limit: number
) => {
   const [isBottom, setIsBottom] = useState(false)

   const {
      loading,
      loadingError,
      loadingMore,
      loadingMoreError,
      hasMore,
      loadMore,
      mappedItems,
   } = useFirestorePagination(query, {
      limit,
   })

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
      window.addEventListener("scroll", handleScroll)
      return () => {
         window.removeEventListener("scroll", handleScroll)
      }
   }, [])

   useEffect(() => {
      if (isBottom && hasMore && !loadingMore && !loading) {
         loadMore()
      }
   }, [isBottom, hasMore, loadingMore, loading])

   return {
      loading,
      loadingError,
      loadingMore,
      loadingMoreError,
      hasMore,
      mappedItems: mappedItems as T[],
   }
}

export default useInfiniteScrollSubscribe
