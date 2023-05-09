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
               {
                  id: "next-live-streams",
                  href: `/next-livestreams`,
                  pathname: `/next-livestreams/[[...livestreamDialog]]`,
                  title: "Next live streams",
               },
               ...(isLoggedIn
                  ? [
                       {
                          id: "my-registrations",
                          href: `/next-livestreams/my-registrations`,
                          pathname: `/next-livestreams/my-registrations`,
                          title: "My registrations",
                       },
                    ]
                  : []),
            ],
         },
         {
            id: "past-live-streams",
            title: "Past live streams",
            mobileTitle: "Past streams",
            Icon: ClockIcon,
            href: `/past-livestreams`,
            pathname: `/past-livestreams/[[...livestreamDialog]]`,
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
