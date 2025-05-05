import {
   CustomJob,
   workplaceOptionsMap,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { useAuth } from "HOCs/AuthProvider"
import useIsMobile from "../useIsMobile"
import useUserCountryCode from "../useUserCountryCode"

type Options = {
   maxLocationsToShow?: number
}

export const useCustomJobLocation = (
   customJob: CustomJob,
   options?: Options
) => {
   const isMobile = useIsMobile()
   const { userData } = useAuth()
   const { userCountryCode: ipBasedCountryCode } = useUserCountryCode()

   const userCountryCode = userData?.countryIsoCode || ipBasedCountryCode

   const locations = customJob.jobLocation || []

   if (locations.length === 0) return { locationText: "", otherLocations: [] }

   const workplaceText =
      customJob.workplace && customJob.workplace !== "on-site"
         ? ` - ${workplaceOptionsMap[customJob.workplace].label}`
         : ""
   // Find location matching user's country code
   const matchingLocation = userCountryCode
      ? locations.find(
           (location) => location.id.substring(0, 2) === userCountryCode
        )
      : null

   const { maxLocationsToShow = isMobile ? 1 : 3 } = options || {}

   // Always show matching location first, then fill with others
   let shownLocations: string[] = []
   let otherLocations = []
   if (matchingLocation) {
      shownLocations = [matchingLocation.name]
      const remaining = locations.filter(
         (loc) => loc.name !== matchingLocation.name
      )
      shownLocations = shownLocations.concat(
         remaining.slice(0, maxLocationsToShow - 1).map((loc) => loc.name)
      )
      otherLocations = remaining.slice(maxLocationsToShow - 1)
   } else {
      shownLocations = locations
         .slice(0, maxLocationsToShow)
         .map((loc) => loc.name)
      otherLocations = locations.slice(maxLocationsToShow)
   }

   const locationText = `${shownLocations.join("; ")}`

   return {
      locationText,
      othersCount: otherLocations.length,
      otherLocations,
      workplaceText,
   }
}
