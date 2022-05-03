import React, { useEffect, useState } from "react"
import { User as ProfileIcon } from "react-feather"
import NextLivestreamsIcon from "@mui/icons-material/Contacts"
import PortalIcon from "@mui/icons-material/DynamicFeed"
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
      href: `/companies`,
      title: "For Companies",
      basePath: "/companies",
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

const landingLinks = [...initialSecondaryLinks]
const useGeneralLinks = () => {
   const { isLoggedOut } = useAuth()
   const [mainLinks] = useState(initialMainLinks)
   const [secondaryLinks, setSecondaryLinks] = useState(initialSecondaryLinks)

   useEffect(() => {
      if (!isLoggedOut) {
         setSecondaryLinks([
            {
               href: `/profile`,
               title: "PROFILE",
               icon: ProfileIcon,
               basePath: "/profile",
            },
            ...initialSecondaryLinks,
         ])
      }
   }, [isLoggedOut])

   return { secondaryLinks, mainLinks, landingLinks }
}

export default useGeneralLinks
