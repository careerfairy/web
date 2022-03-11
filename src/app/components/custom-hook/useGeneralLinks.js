import React, { useEffect, useState } from "react"
import { User as ProfileIcon } from "react-feather"
import { useAuth } from "../../HOCs/AuthProvider"
import NextLivestreamsIcon from "@mui/icons-material/Contacts"
import FollowGroupIcon from "@mui/icons-material/GroupAdd"
import WishlistIcon from "@mui/icons-material/Stars"

const initialMainLinks = [
   {
      href: `/next-livestreams`,
      title: "NEXT LIVE STREAMS",
      basePath: "/next-livestreams",
      icon: NextLivestreamsIcon,
   },
   {
      href: `/wishlist`,
      title: "WISHLIST",
      basePath: "/wishlist",
      icon: WishlistIcon,
   },
   {
      href: `/groups`,
      title: "FOLLOW GROUPS",
      basePath: "/groups",
      icon: FollowGroupIcon,
   },
]
const initialSecondaryLinks = [
   {
      href: `/students`,
      title: "For Students",
      basePath: "/students",
   },
   {
      href: `/`,
      title: "For Companies",
      basePath: "/",
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
   const { authenticatedUser } = useAuth()

   const [mainLinks] = useState(initialMainLinks)
   const [secondaryLinks, setSecondaryLinks] = useState(initialSecondaryLinks)

   useEffect(() => {
      if (authenticatedUser?.emailVerified) {
         setSecondaryLinks([
            ...initialSecondaryLinks,
            {
               href: `/profile`,
               title: "PROFILE",
               icon: ProfileIcon,
               basePath: "/profile",
            },
         ])
      }
   }, [authenticatedUser?.emailVerified])

   return { secondaryLinks, mainLinks, landingLinks }
}

export default useGeneralLinks
