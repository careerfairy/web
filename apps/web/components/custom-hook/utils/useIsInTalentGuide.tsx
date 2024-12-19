import { useRouter } from "next/router"
import { useMemo } from "react"

export const useIsInTalentGuide = () => {
   const router = useRouter()

   return useMemo(() => {
      return router.pathname.includes("/talent-guide")
   }, [router.pathname])
}
