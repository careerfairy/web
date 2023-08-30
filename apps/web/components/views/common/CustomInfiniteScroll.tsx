import { ReactNode, useRef, useState, useEffect } from "react"

type CustomInfiniteScrollProps = {
   hasMore: boolean
   loading: boolean
   next: () => Promise<void>
   children: ReactNode
   offset?: number // Here's the offset prop
}

const CustomInfiniteScroll = ({
   hasMore,
   loading,
   next,
   children,
   offset,
}: CustomInfiniteScrollProps) => {
   const [isLoadingMore, setIsLoadingMore] = useState(false)
   const loaderRef = useRef<HTMLDivElement | null>(null)

   useEffect(() => {
      if (isLoadingMore || !hasMore) return

      const loaderNode = loaderRef.current

      // Helper function to handle the loading logic.
      const loadMore = () => {
         if (!loading) {
            setIsLoadingMore(true)
            next().finally(() => setIsLoadingMore(false))
         }
      }

      // Intersection Observer Callback with enhanced type safety.
      const handleIntersect = (entries: IntersectionObserverEntry[]) => {
         if (entries[0].isIntersecting) {
            loadMore()
         }
      }

      const observer = new IntersectionObserver(handleIntersect, {
         threshold: 1,
         rootMargin: `-${offset || 0}px 0px 0px 0px`,
      })

      if (loaderNode) {
         observer.observe(loaderNode)

         // Initial Check: This checks on mount whether the loader is already visible or within the offset.
         const isLoaderInView =
            loaderNode.getBoundingClientRect().bottom <=
            window.innerHeight + (offset || 0)
         if (isLoaderInView) {
            loadMore()
         }
      }

      return () => {
         if (loaderNode) observer.unobserve(loaderNode)
      }
   }, [hasMore, loading, next, isLoadingMore, offset])

   return (
      <>
         {children}
         <div ref={loaderRef}></div>
      </>
   )
}

export default CustomInfiniteScroll
