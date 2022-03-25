import React, { useEffect, useState } from "react"
import { User as ProfileIcon } from "react-feather"
import NextLivestreamsIcon from "@mui/icons-material/Contacts"
import FollowGroupIcon from "@mui/icons-material/GroupAdd"
import PortalIcon from "@mui/icons-material/DynamicFeed"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"

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
   const firebase = useFirebaseService()

   const [mainLinks] = useState(initialMainLinks)
   const [secondaryLinks, setSecondaryLinks] = useState(initialSecondaryLinks)

   useEffect(() => {
      if (firebase.auth?.currentUser?.emailVerified) {
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
   }, [firebase.auth?.currentUser?.emailVerified])

   return { secondaryLinks, mainLinks, landingLinks }
}

export default useGeneralLinks
