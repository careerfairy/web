import { PublicGroup } from "@careerfairy/shared-lib/groups"
import useUserCountryCode from "components/custom-hook/useUserCountryCode"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"

export const useUserIsCompanyTargeted = (group: PublicGroup) => {
   const { userData, isLoggedIn } = useAuth()
   const { userCountryCode, isLoading } = useUserCountryCode()

   const isUserCompanyTargeted = useMemo(() => {
      // If user is logged out, not targeted
      if (!isLoggedIn) return false

      // Prefer saved user country; if missing, fallback to IP-based when available
      const userCode =
         userData?.countryIsoCode ?? (isLoading ? undefined : userCountryCode)

      if (!userCode) return false

      return (
         group?.targetedCountries?.some((country) => country.id === userCode) ??
         false
      )
   }, [
      group?.targetedCountries,
      isLoggedIn,
      userData?.countryIsoCode,
      userCountryCode,
      isLoading,
   ])

   return isUserCompanyTargeted
}
