import {
   swissGermanCountryFilters,
   userIsTargetedLevels,
} from "@careerfairy/shared-lib/countries/filters"
import { useAuth } from "HOCs/AuthProvider"
import { CompanyIcon } from "components/views/common/icons"
import { HomeIcon } from "components/views/common/icons/HomeIcon"
import { JobsIcon } from "components/views/common/icons/JobsIcon"
import { LevelsIcon } from "components/views/common/icons/LevelsIcon"
import { LiveStreamsIcon } from "components/views/common/icons/LiveStreamsIcon"
import { RecordingIcon } from "components/views/common/icons/RecordingIcon"
import { SparksIcon } from "components/views/common/icons/SparksIcon"
import { useMemo } from "react"
import useUserCountryCode from "../components/custom-hook/useUserCountryCode"
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
 * @returns Array of filtered navigation links
 */
export const useNavLinks = (
   isMobile: boolean,
   serverUserCountryCode?: string
) => {
   const { userData } = useAuth()
   const { userCountryCode: ipBasedUserCountryCode } = useUserCountryCode(
      !serverUserCountryCode?.length || !userData?.countryIsoCode
   )

   const userCountryCode =
      serverUserCountryCode ||
      userData?.countryIsoCode ||
      ipBasedUserCountryCode
   return useMemo(() => {
      const disabledLevels = !(userData
         ? userIsTargetedLevels(userData)
         : swissGermanCountryFilters.includes(userCountryCode))

      const disabledCompanies = !(
         !userCountryCode ||
         !(
            isMobile &&
            userCountryCode &&
            swissGermanCountryFilters.includes(userCountryCode)
         )
      )

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
            disabled: disabledLevels,
         },
         {
            id: "company",
            href: `/companies`,
            pathname: `/companies`,
            Icon: CompanyIcon,
            title: "Companies",
            disabled: disabledCompanies,
         },
      ]

      // Apply filtering

      return links.filter((link) => !link.disabled)
   }, [isMobile, userData, userCountryCode])
}
