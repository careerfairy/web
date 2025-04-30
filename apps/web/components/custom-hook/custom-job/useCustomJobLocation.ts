import {
   CustomJob,
   CustomJobWorkplace,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { useAuth } from "HOCs/AuthProvider"
import useUserCountryCode from "../useUserCountryCode"
const validWorkplaceOptions: CustomJobWorkplace[] = ["hybrid", "remote"]

export const useCustomJobLocation = (customJob: CustomJob) => {
   const { userData } = useAuth()
   const { userCountryCode: ipBasedCountryCode } = useUserCountryCode()

   const userCountryCode = userData?.countryIsoCode || ipBasedCountryCode

   const locations = customJob.jobLocation || []

   if (locations.length === 0) return ""

   const workplaceText =
      customJob.workplace && validWorkplaceOptions.includes(customJob.workplace)
         ? "(Remote)"
         : ""
   // Find location matching user's country code
   const matchingLocation = userCountryCode
      ? locations.find(
           (location) => location.id.substring(0, 2) === userCountryCode
        )
      : null

   // If we found a matching location, use it as first location
   // Otherwise use the first location from the array
   const firstLocation = matchingLocation?.name || locations[0]?.name

   // Calculate remaining locations count (excluding the first location)
   const otherLocationsCount = locations.length - 1

   return `${firstLocation}${
      otherLocationsCount ? `, +${otherLocationsCount}` : ""
   } ${workplaceText}`
}
