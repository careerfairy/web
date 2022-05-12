import { useEffect, useState } from "react"
import isEqual from "react-fast-compare"
import { usePrevious } from "react-use"

const useIsBottom = (deps?: any[]) => {
   const [isBottom, setIsBottom] = useState(false)
   const prevDeps = usePrevious(deps)

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
   }, [isEqual(deps, prevDeps)])

   return isBottom
}

export default useIsBottom
