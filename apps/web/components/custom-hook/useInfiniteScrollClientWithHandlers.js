import { useEffect, useState } from "react"

const initialTotal = []
const useInfiniteScrollClientWithHandlers = (
   data,
   limit = 3,
   loadAdditional = 0,
   containerRef = null
) => {
   const [hasMore, setHasMore] = useState(true)
   const [totalItems, setTotalItems] = useState(data || initialTotal)
   const [end, setEnd] = useState(limit)
   const [items, setItems] = useState(totalItems.slice(0, end))

   useEffect(() => {
      const paginatedItems = totalItems.slice(0, end)
      setItems(paginatedItems)
   }, [end, totalItems])

   useEffect(() => {
      setHasMore(totalItems.length > items.length)
   }, [items, totalItems.length])

   useEffect(() => {
      setTotalItems(data || initialTotal)
   }, [data])

   useEffect(() => {
      handleScroll()
   }, [totalItems?.length, items?.length])

   const handleScroll = () => {
      const node = containerRef?.current || document.documentElement
      const bottom =
         Math.ceil(node.clientHeight + node.scrollTop) >=
         node.scrollHeight * 0.4
      if (bottom && hasMore) {
         getMore()
      }
   }

   useEffect(() => {
      const node = containerRef?.current || window
      node.addEventListener("scroll", handleScroll)

      return () => {
         node.removeEventListener("scroll", handleScroll)
      }
   }, [totalItems, items, containerRef])

   const getMore = () => {
      const stillMore = Boolean(totalItems.length > items.length)
      if (stillMore) {
         setEnd((prevState) => prevState + (limit + loadAdditional))
      }
   }

   return [items, getMore, hasMore, totalItems]
}

export default useInfiniteScrollClientWithHandlers
