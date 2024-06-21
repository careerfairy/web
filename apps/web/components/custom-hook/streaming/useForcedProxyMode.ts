import { useRouter } from "next/router"
import { useMemo } from "react"

/**
 * Custom hook to determine if the forced proxy mode should be enabled based on the URL query parameter.
 * @returns {number | false} The forced proxy mode value or false if not applicable.
 */
export const useForcedProxyMode = () => {
   const router = useRouter()

   return useMemo(() => {
      const proxyModeValue = router.query.withProxyMode
      if (proxyModeValue) {
         const parsedValue = parseInt(proxyModeValue as string, 10)
         if (!isNaN(parsedValue) && parsedValue > 0) {
            return parsedValue
         }
      }
      return false
   }, [router.query.withProxyMode])
}
