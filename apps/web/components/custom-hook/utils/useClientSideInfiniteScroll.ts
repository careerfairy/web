import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

interface UseClientSideInfiniteScrollOptions<T> {
   data: T[]
   itemsPerPage: number
}

interface UseClientSideInfiniteScrollResult<T> {
   visibleData: T[]
   hasMore: boolean
   loadMore: () => void
   isLoading: boolean
   ref: (node?: Element | null | undefined) => void
}

const useClientSideInfiniteScroll = <T>({
   data,
   itemsPerPage,
}: UseClientSideInfiniteScrollOptions<T>): UseClientSideInfiniteScrollResult<T> => {
   const [visibleCount, setVisibleCount] = useState(itemsPerPage)
   const [isLoading, setIsLoading] = useState(false)
   const isLoadingRef = useRef(false)

   const { inView, ref } = useInView({
      rootMargin: "0px 0px 200px 0px",
   })

   const visibleData = useMemo(() => {
      return data.slice(0, visibleCount)
   }, [data, visibleCount])

   const hasMore = visibleCount < data.length

   const loadMore = useCallback(() => {
      if (isLoadingRef.current || !hasMore) return

      setIsLoading(true)
      isLoadingRef.current = true

      // Simulate loading delay for better UX
      setTimeout(() => {
         setVisibleCount((prev) => Math.min(prev + itemsPerPage, data.length))
         setIsLoading(false)
         isLoadingRef.current = false
      }, 300)
   }, [hasMore, itemsPerPage, data.length])

   // Reset visible count when data changes (e.g., search/sort)
   useEffect(() => {
      setVisibleCount(itemsPerPage)
   }, [data, itemsPerPage])

   // Auto-load when intersection observer triggers
   useEffect(() => {
      if (inView && hasMore && !isLoadingRef.current) {
         loadMore()
      }
   }, [inView, hasMore, loadMore])

   return {
      visibleData,
      hasMore,
      loadMore,
      isLoading,
      ref,
   }
}

export default useClientSideInfiniteScroll
