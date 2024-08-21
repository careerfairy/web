import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useUserCountryCode from "components/custom-hook/useUserCountryCode"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"

export const useIsLivestreamTargetedUser = (livestream: LivestreamEvent) => {
   const { userData, isLoggedIn } = useAuth()
   const { userCountryCode, isLoading } = useUserCountryCode()

   const isUserFromTargetedCountry = useMemo(() => {
      if (isLoading) return false

      const isTargetedUser =
         livestream.targetCountries?.filter((country) => {
            const userCode = isLoggedIn
               ? userData?.universityCountryCode
               : userCountryCode

            return country.id === userCode
         })?.length > 0

      return isTargetedUser
   }, [
      livestream.targetCountries,
      isLoading,
      isLoggedIn,
      userData?.universityCountryCode,
      userCountryCode,
   ])

   return isUserFromTargetedCountry
}
