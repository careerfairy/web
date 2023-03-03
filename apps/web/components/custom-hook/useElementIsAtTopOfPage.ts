import { useState, useEffect, useRef, MutableRefObject } from "react"

interface UseStickyElementOptions {
   offset?: number
}

type UseStickyElementReturnType = [
   MutableRefObject<HTMLElement | null>,
   boolean
]

const useElementIsAtTopOfPage = (
   options: UseStickyElementOptions = {}
): UseStickyElementReturnType => {
   const { offset = 0 } = options
   const elementRef = useRef<HTMLElement | null>(null)
   const [isAtTopOfPage, setIsAtTopOfPage] = useState(false)

   useEffect(() => {
      const handleScroll = () => {
         if (!elementRef.current) {
            return
         }

         const elementTop = elementRef.current.getBoundingClientRect().top
         setIsAtTopOfPage(elementTop <= offset)
      }

      window.addEventListener("scroll", handleScroll)

      return () => {
         window.removeEventListener("scroll", handleScroll)
      }
   }, [offset])

   return [elementRef, isAtTopOfPage]
}

export default useElementIsAtTopOfPage
