import { useEffect, useState } from "react"

const useInfiniteScrollClient = (data = [], limit = 3, loadAdditional = 0) => {
   const [hasMore, setHasMore] = useState(true)
   const [items, setItems] = useState([])
   const [totalItems, setTotalItems] = useState([])
   const [end, setEnd] = useState(limit)

   useEffect(() => {
      const paginatedItems = totalItems.slice(0, end)
      setItems(paginatedItems)
   }, [end, totalItems])

   useEffect(() => {
      setHasMore(totalItems.length > items.length)
   }, [items, totalItems.length])

   useEffect(() => {
      setTotalItems(data)
   }, [data])

   const getMore = () => {
      const stillMore = Boolean(totalItems.length > items.length)
      if (stillMore) {
         setEnd((prevState) => prevState + (limit + loadAdditional))
      }
   }

   return [items, getMore, hasMore, totalItems]
}

export default useInfiniteScrollClient
