import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

/**
 * Options for configuring the client-side infinite scroll hook
 */
type UseClientSideInfiniteScrollOptions<T> = {
   /** The complete dataset to paginate through */
   data: T[]
   /** Number of items to show per page/load */
   itemsPerPage: number
}

/**
 * Return object from the client-side infinite scroll hook
 */
type UseClientSideInfiniteScrollResult<T> = {
   /** Currently visible/paginated data */
   visibleData: T[]
   /** Whether there are more items to load */
   hasMore: boolean
   /** Ref to attach to the element that triggers loading when in view */
   ref: (node?: Element | null | undefined) => void
}

/**
 * A modern client-side infinite scroll hook that uses Intersection Observer for better performance.
 *
 * This hook is ideal for:
 * - Client-side pagination of static data
 * - Search results that are already loaded
 * - Filtered/sorted data that needs progressive loading
 * - Any scenario where you have all data but want to show it progressively
 *
 * @example
 * ```tsx
 * const { visibleData, hasMore, ref } = useClientSideInfiniteScroll({
 *    data: searchResults,
 *    itemsPerPage: 10
 * })
 *
 * return (
 *    <div>
 *       {visibleData.map(item => <Item key={item.id} {...item} />)}
 *       {hasMore && <div ref={ref} />}
 *    </div>
 * )
 * ```
 *
 * @param options - Configuration options for the infinite scroll behavior
 * @returns Object containing paginated data and control functions
 */
const useClientSideInfiniteScroll = <T>({
   data,
   itemsPerPage,
}: UseClientSideInfiniteScrollOptions<T>): UseClientSideInfiniteScrollResult<T> => {
   const [visibleCount, setVisibleCount] = useState(itemsPerPage)
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

      isLoadingRef.current = true

      // Simulate loading delay for better UX
      setTimeout(() => {
         setVisibleCount((prev) => Math.min(prev + itemsPerPage, data.length))
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
      ref,
   }
}

export default useClientSideInfiniteScroll
