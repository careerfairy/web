import { useRouter } from "next/router"

/**
 * Custom hook to force streaming to be in 1080p and not in an optimized format based on the URL query parameter.
 * @returns True if high quality mode is enabled, otherwise false.
 */
export const useHighQualityMode = () => {
   const router = useRouter()

   return router.query.withHighQuality
}
