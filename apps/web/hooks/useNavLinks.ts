import { CompanyIcon } from "components/views/common/icons"
import { HomeIcon } from "components/views/common/icons/HomeIcon"
import { JobsIcon } from "components/views/common/icons/JobsIcon"

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
 * Hook that provides navigation links based on device type
 * @param isMobile - Whether the screen is mobile
 * @returns Array of navigation links
 */
export const useNavLinks = (isMobile: boolean) => {
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
            pathname: `/jobs/[[...livestreamDialog]]`,
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
            id: "company",
            href: `/companies`,
            pathname: `/companies`,
            Icon: CompanyIcon,
            title: "Companies",
         },
      ]

      return links
   }, [isMobile])
}
