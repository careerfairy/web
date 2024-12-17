import { CompanyIcon } from "components/views/common/icons"
import { useEffect, useState } from "react"
import {
   Calendar as CalendarIcon,
   Search as FindIcon,
   User as ProfileIcon,
   Smartphone as SmartphoneIcon,
   BarChart2 as StatisticsIcon,
   Film as StreamIcon,
} from "react-feather"
import { useAuth } from "../../HOCs/AuthProvider"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"

const initialHeaderLinks = [
   {
      href: `/portal`,
      title: "PORTAL",
   },
   {
      href: `/next-livestreams`,
      title: "NEXT LIVE STREAMS",
   },
]
const initialDrawerBottomLinks = [
   {
      href: `https://companies.careerfairy.io`,
      title: "FOR COMPANIES",
   },
   {
      href: `/career-center`,
      title: "FOR CAREER CENTERS",
   },
   {
      href: `/about-us`,
      title: "About Us",
      basePath: "/about-us",
   },
]

const pushNotificationTesters = [
   "matilde.ramos@careerfairy.io",
   "goncalo@careerfairy.io",
   "puzic.sead@gmail.com",
   "puzic.sead+test1234@gmail.com",
   "simone@careerfairy.io",
   "habib@careerfairy.io",
   "lucas@careerfairy.io",
   "carlos.rijo@careerfairy.io",
   "walter@careerfairy.io",
   "amal-thomas.roy@careerfairy.io",
]
const useAdminLinks = () => {
   const { userData } = useAuth()
   const firebase = useFirebaseService()

   const [headerLinks, setHeaderLinks] = useState(initialHeaderLinks)
   const [drawerBottomLinks, setDrawerBottomLinks] = useState(
      initialDrawerBottomLinks
   )
   const [drawerTopLinks, setDrawerTopLinks] = useState([])

   useEffect(() => {
      if (firebase.auth?.currentUser?.emailVerified) {
         setHeaderLinks([
            ...initialHeaderLinks,
            {
               href: `/groups`,
               title: "FOLLOW GROUPS",
               basePath: "/groups",
            },
         ])

         setDrawerBottomLinks([
            ...initialDrawerBottomLinks,
            {
               href: `/profile`,
               title: "PROFILE",
               icon: ProfileIcon,
               basePath: "/profile",
            },
         ])
      }
   }, [firebase.auth?.currentUser?.emailVerified])

   useEffect(() => {
      if (userData?.isAdmin) {
         setDrawerTopLinks([
            {
               href: `/admin/statistics`,
               icon: StatisticsIcon,
               title: "Statistics",
               basePath: `/admin/statistics`,
            },
            {
               href: `/admin/upcoming-livestreams`,
               icon: StreamIcon,
               title: "Upcoming Streams",
               basePath: `/admin/upcoming-livestreams`,
            },
            {
               href: `/admin/past-livestreams`,
               icon: StreamIcon,
               title: "Past Streams",
               basePath: `/admin/past-livestreams`,
            },
            {
               href: `/admin/query-users`,
               icon: FindIcon,
               title: "Query Users",
               basePath: `/admin/query-users`,
            },
            ...(pushNotificationTesters.includes(userData.userEmail)
               ? [
                    {
                       href: `/admin/saved-push-notifications`,
                       icon: SmartphoneIcon,
                       title: "Push Notifications",
                       basePath: `/admin/saved-push-notifications`,
                    },
                 ]
               : []),
            {
               href: `/admin/academic-calendar-manager`,
               icon: CalendarIcon,
               title: "Academic Calendar",
               basePath: `/admin/academic-calendar-manager`,
            },
            {
               href: `/admin/company-plans`,
               icon: CompanyIcon,
               title: "Companies",
               basePath: `/admin/company-plans`,
            },
         ])
      } else {
         setDrawerTopLinks([])
      }
   }, [userData?.isAdmin, userData?.userEmail])

   return { drawerBottomLinks, drawerTopLinks, headerLinks }
}

export default useAdminLinks
