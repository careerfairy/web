import React, { useMemo } from "react"

// react feather
import { Radio as LiveStreamsIcon, Home as HomeIcon } from "react-feather"

// material-ui
import DomainIcon from "@mui/icons-material/Domain"
import { INavLink } from "../types"
import ClockIcon from "@mui/icons-material/AccessTime"
import NavList from "../common/NavList"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import BottomNavBar from "./BottomNavBar"
import { useAuth } from "../../HOCs/AuthProvider"

export const MyRegistrationsPath: INavLink = {
   id: "my-registrations",
   href: `/next-livestreams/my-registrations`,
   pathname: `/next-livestreams/my-registrations`,
   title: "My registrations",
}

export const NextLivestreamsPath: INavLink = {
   id: "next-live-streams",
   href: `/next-livestreams`,
   pathname: `/next-livestreams/[[...livestreamDialog]]`,
   title: "Next live streams",
}
export const UnlockedContentPath: INavLink = {
   id: "unlocked-content",
   href: `/past-livestreams/unlocked-content`,
   pathname: `/past-livestreams/unlocked-content`,
   title: "Unlocked content",
}

export const PastLivestreamsPath: INavLink = {
   id: "all-past-live-streams",
   href: `/past-livestreams`,
   pathname: `/past-livestreams/[[...livestreamDialog]]`,
   title: "All past streams",
}

const GenericNavList = () => {
   const isMobile = useIsMobile()
   const { isLoggedIn } = useAuth()

   const navLinks = useMemo(() => {
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
            childLinks: [
               NextLivestreamsPath,
               ...(isLoggedIn ? [MyRegistrationsPath] : []),
            ],
         },
         {
            id: "past-live-streams",
            title: "Past live streams",
            mobileTitle: "Past streams",
            Icon: ClockIcon,
            href: `/past-livestreams`,
            childLinks: [
               PastLivestreamsPath,
               ...(isLoggedIn ? [UnlockedContentPath] : []),
            ],
         },
         {
            id: "company",
            href: `/companies`,
            pathname: `/companies`,
            Icon: DomainIcon,
            title: "Companies",
         },
      ]

      return links
   }, [isLoggedIn])

   return isMobile ? (
      <BottomNavBar links={navLinks} />
   ) : (
      <NavList links={navLinks} />
   )
}

export default GenericNavList
