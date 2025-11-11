import AutoModeIcon from "@mui/icons-material/AutoMode"
import NextLivestreamsIcon from "@mui/icons-material/Contacts"
import PortalIcon from "@mui/icons-material/DynamicFeed"
import ReferralIcon from "@mui/icons-material/GroupAdd"
import GroupsIcon from "@mui/icons-material/Groups"
import { SvgIconTypeMap } from "@mui/material"
import { OverridableComponent } from "@mui/material/OverridableComponent"
import React, { useEffect, useState } from "react"
import { User as ProfileIcon } from "react-feather"
import { useAuth } from "../../HOCs/AuthProvider"

const initialMainLinks = [
   {
      href: `/portal`,
      title: "PORTAL",
      basePath: "/portal",
      icon: PortalIcon,
   },
   {
      href: `/next-livestreams`,
      title: "NEXT LIVE STREAMS",
      basePath: "/next-livestreams",
      icon: NextLivestreamsIcon,
   },
]
const initialSecondaryLinks = [
   {
      href: `/`,
      title: "For Students",
      basePath: "/",
   },
   {
      href: `https://companies.careerfairy.io`,
      title: "For Companies",
   },
   {
      href: `/career-center`,
      title: "For Career Centers",
      basePath: "/career-center",
   },
   {
      href: `/about-us`,
      title: "About Us",
      basePath: "/about-us",
   },
]

const authenticatedUserTopLinks: PageLinkProps[] = [
   {
      href: `/profile`,
      title: "Profile",
      basePath: "/profile",
      // @ts-ignore
      icon: ProfileIcon,
   },
   {
      href: "/profile/career-skills",
      title: "My Career Skills",
      basePath: "/profile/career-skills",
      icon: AutoModeIcon,
   },
   {
      href: "/profile/referrals",
      title: "Referrals",
      basePath: "/profile/referrals",
      icon: ReferralIcon,
   },
   {
      href: "/profile/groups",
      title: "Groups",
      basePath: "/profile/groups",
      icon: GroupsIcon,
   },
]
const authenticatedUserBottomLinks: PageLinkProps[] = [
   {
      href: `/`,
      title: "For Students",
      basePath: "/",
   },
   {
      href: `https://companies.careerfairy.io`,
      title: "For Companies",
   },
   {
      href: `/career-center`,
      title: "For Career Centers",
      basePath: "/career-center",
   },
   {
      href: `/about-us`,
      title: "About Us",
      basePath: "/about-us",
   },
]

export interface PageLinkProps {
   href: string
   title: string
   basePath?: string
   // eslint-disable-next-line @typescript-eslint/ban-types
   icon?: React.ReactElement | OverridableComponent<SvgIconTypeMap<{}, "svg">>
}

const landingLinks: PageLinkProps[] = [...initialSecondaryLinks]
const eventLinks: PageLinkProps[] = [
   {
      href: `/portal`,
      title: "Portal",
      basePath: "/portal",
      icon: PortalIcon,
   },
   {
      href: `/next-livestreams`,
      title: "NEXT LIVE STREAMS",
      basePath: "/next-livestreams",
      icon: NextLivestreamsIcon,
   },
]
const useGeneralLinks = () => {
   const { isLoggedOut } = useAuth()
   // eslint-disable-next-line react/hook-use-state
   const [mainLinks] = useState<PageLinkProps[]>(initialMainLinks)
   const [secondaryLinks, setSecondaryLinks] = useState<PageLinkProps[]>(
      initialSecondaryLinks
   )

   useEffect(() => {
      if (!isLoggedOut) {
         setSecondaryLinks([
            {
               href: `/profile`,
               title: "PROFILE",
               // @ts-ignore
               icon: ProfileIcon,
               basePath: "/profile",
            },
            ...initialSecondaryLinks,
         ])
      }
   }, [isLoggedOut])

   return {
      secondaryLinks,
      mainLinks,
      landingLinks,
      authenticatedUserTopLinks,
      authenticatedUserBottomLinks,
      eventLinks,
   }
}

export default useGeneralLinks
