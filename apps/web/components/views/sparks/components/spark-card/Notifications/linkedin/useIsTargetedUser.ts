import { PublicGroup } from "@careerfairy/shared-lib/groups"
import useUserCountryCode from "components/custom-hook/useUserCountryCode"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"

export const useIsTargetedUser = (group: PublicGroup) => {
   const { userData, isLoggedIn } = useAuth()
   const { userCountryCode, isLoading } = useUserCountryCode()

   const isUserFromTargetedCountry = useMemo(() => {
      if (isLoading) return false

      const isTargetedUser =
         group.targetedCountries.filter((country) => {
            const userCode = isLoggedIn
               ? userData?.universityCountryCode
               : userCountryCode

            return country.id === userCode
         }).length > 0

      return isTargetedUser
   }, [
      group.targetedCountries,
      isLoading,
      isLoggedIn,
      userData?.universityCountryCode,
      userCountryCode,
   ])

   return isUserFromTargetedCountry
}
