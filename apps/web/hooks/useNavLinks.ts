import {
   swissGermanCountryFilters,
   userIsTargetedLevels,
} from "@careerfairy/shared-lib/countries/filters"
import { useAuth } from "HOCs/AuthProvider"
import useUserCountryCode from "components/custom-hook/useUserCountryCode"
import { CompanyIcon } from "components/views/common/icons"
import { HomeIcon } from "components/views/common/icons/HomeIcon"
import { JobsIcon } from "components/views/common/icons/JobsIcon"
import { LevelsIcon } from "components/views/common/icons/LevelsIcon"
import { LiveStreamsIcon } from "components/views/common/icons/LiveStreamsIcon"
import { RecordingIcon } from "components/views/common/icons/RecordingIcon"
import { SparksIcon } from "components/views/common/icons/SparksIcon"
import { useMemo } from "react"
import { INavLink } from "../layouts/types"

// Constants for reusable nav paths
export const NextLivestreamsPath: INavLink = {
   id: "next-live-streams",
   href: `/next-livestreams`,
   pathname: `/next-livestreams/[[...livestreamDialog]]`,
   title: "Live streams",
   Icon: LiveStreamsIcon,
}

export const PastLivestreamsPath: INavLink = {
   id: "all-past-live-streams",
   href: `/past-livestreams`,
   pathname: `/past-livestreams/[[...livestreamDialog]]`,
   title: "Recordings",
   Icon: RecordingIcon,
}

/**
 * Hook that provides filtered navigation links based on user permissions and country
 * @param isMobile - Whether the screen is mobile
 * @param userCountryCode - The country code of the user, determined by the request header
 * 'x-vercel-ip-country' during SSR
 * @returns Array of filtered navigation links
 */
export const useNavLinks = (isMobile: boolean, countryCode?: string) => {
   const { userData } = useAuth()
   const { userCountryCode: ipBasedUserCountryCode } = useUserCountryCode(
      !countryCode?.length
   )

   const userCountryCode =
      countryCode || userData?.countryIsoCode || ipBasedUserCountryCode

   // TODO: Implement dynamic ranking of links based on user country code
   return useMemo(() => {
      // Define base navigation links
      const links: INavLink[] = [
         {
            id: "home-page",
            href: `/portal`,
            pathname: `/portal/[[...livestreamDialog]]`,
            Icon: HomeIcon,
            title: "Home page",
            mobileTitle: "Home",
         },
         {
            id: "live-streams",
            title: "Live streams",
            mobileTitle: "Live streams",
            Icon: LiveStreamsIcon,
            href: `/next-livestreams`,
            pathname: `/next-livestreams/[[...livestreamDialog]]`,
            ...(isMobile
               ? {
                    childLinks: [NextLivestreamsPath, PastLivestreamsPath],
                 }
               : []),
         },
         {
            id: "sparks",
            href: `/sparks`,
            pathname: `/sparks/[sparkId]`,
            Icon: SparksIcon,
            title: "Sparks",
         },
         {
            id: "jobs",
            href: `/jobs`,
            pathname: `/jobs`,
            Icon: JobsIcon,
            title: "Jobs",
         },
         ...(!isMobile
            ? [
                 {
                    id: "past-live-streams",
                    title: "Recordings",
                    mobileTitle: "Recordings",
                    Icon: RecordingIcon,
                    href: `/past-livestreams`,
                    pathname: `/past-livestreams/[[...livestreamDialog]]`,
                 },
              ]
            : []),
         {
            id: "levels",
            href: `/levels`,
            pathname: `/levels`,
            Icon: LevelsIcon,
            title: "Levels",
         },

         {
            id: "company",
            href: `/companies`,
            pathname: `/companies`,
            Icon: CompanyIcon,
            title: "Companies",
         },
      ]

      // Apply filtering
      return links.filter((link) => {
         if (link.id === "levels") {
            return userData
               ? userIsTargetedLevels(userData)
               : swissGermanCountryFilters.includes(userCountryCode)
         }
         if (link.id === "company") {
            return (
               !userCountryCode ||
               !(
                  isMobile &&
                  userCountryCode &&
                  swissGermanCountryFilters.includes(userCountryCode)
               )
            )
         }
         return true
      })
   }, [isMobile, userData, userCountryCode])
}
