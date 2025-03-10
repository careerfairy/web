import { FieldOfStudyCategoryMap } from "@careerfairy/shared-lib/fieldOfStudy"
import { Group } from "@careerfairy/shared-lib/groups"
import { useAuth } from "HOCs/AuthProvider"
import { CompanySearchResult } from "types/algolia"
import useUserCountryCode from "../useUserCountryCode"

/**
 * Custom hook which fetches a list of featured companies, based
 * on the current logged in user. The match for the featured companies
 * is based on the user's field of study category and country relative to the
 * featured group target countries and audience.
 */
const useIsUserFeaturedCompany = (group: Group | CompanySearchResult) => {
   const { userCountryCode } = useUserCountryCode()
   const { userData, isLoggedIn } = useAuth()

   const countryCode = userData?.countryIsoCode || userCountryCode
   const inTargetCountries =
      countryCode && group?.featured?.targetCountries?.includes(countryCode)

   if (!isLoggedIn && countryCode) return inTargetCountries

   if (!isLoggedIn || !userData?.fieldOfStudy?.id || !countryCode) return false

   const inTargetAudience = group?.featured?.targetAudience?.includes(
      FieldOfStudyCategoryMap[userData?.fieldOfStudy?.id]
   )

   return inTargetAudience && inTargetCountries
}

export default useIsUserFeaturedCompany
