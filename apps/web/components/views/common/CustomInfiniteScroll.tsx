import { ReactNode, useRef, useState, useEffect } from "react"

type CustomInfiniteScrollProps = {
   hasMore: boolean
   loading: boolean
   next: () => Promise<void>
   children: ReactNode
}

const CustomInfiniteScroll = ({
   hasMore,
   loading,
   next,
   children,
}: CustomInfiniteScrollProps) => {
   const [isLoadingMore, setIsLoadingMore] = useState(false)
   const loaderRef = useRef<HTMLDivElement | null>(null)

   useEffect(() => {
      if (isLoadingMore || !hasMore) return
      const loaderNode = loaderRef.current
      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting && !loading) {
               setIsLoadingMore(true)
               next().finally(() => setIsLoadingMore(false))
            }
         },
         { threshold: 1 }
      )
      if (loaderNode) observer.observe(loaderNode)
      return () => {
         if (loaderNode) observer.unobserve(loaderNode)
      }
   }, [hasMore, loading, next, isLoadingMore])

   return (
      <>
         {children}
         <div ref={loaderRef}></div>
      </>
   )
}

export default CustomInfiniteScroll
