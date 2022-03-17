import React, { useEffect, useState } from "react";
import {
   BarChart2 as StatisticsIcon,
   Film as StreamIcon,
   User as ProfileIcon,
   Search as FindIcon,
} from "react-feather";
import { useAuth } from "../../HOCs/AuthProvider";

const initialHeaderLinks = [
   {
      href: `/portal`,
      title: "PORTAL",
   },
   {
      href: `/next-livestreams`,
      title: "NEXT LIVE STREAMS",
   },
];
const initialDrawerBottomLinks = [
   {
      href: `https://corporate.careerfairy.io/companies`,
      title: "FOR COMPANIES",
   },
   {
      href: `https://corporate.careerfairy.io/career-center`,
      title: "FOR CAREER CENTERS",
   },
   {
      href: `/about-us`,
      title: "About Us",
      basePath: "/about-us",
   },
];
const useAdminLinks = () => {
   const { authenticatedUser, userData } = useAuth();

   const [headerLinks, setHeaderLinks] = useState(initialHeaderLinks);
   const [drawerBottomLinks, setDrawerBottomLinks] = useState(
      initialDrawerBottomLinks
   );
   const [drawerTopLinks, setDrawerTopLinks] = useState([]);

   useEffect(() => {
      if (authenticatedUser?.emailVerified) {
         setHeaderLinks([
            ...initialHeaderLinks,
            {
               href: `/groups`,
               title: "FOLLOW GROUPS",
               basePath: "/groups",
            },
         ]);

         setDrawerBottomLinks([
            ...initialDrawerBottomLinks,
            {
               href: `/profile`,
               title: "PROFILE",
               icon: ProfileIcon,
               basePath: "/profile",
            },
         ]);
      }
   }, [authenticatedUser?.emailVerified]);

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
               title: "Query and Manage Users",
               basePath: `/admin/query-users`,
            },
         ]);
      } else {
         setDrawerTopLinks([]);
      }
   }, [userData?.isAdmin]);

   return { drawerBottomLinks, drawerTopLinks, headerLinks };
};

export default useAdminLinks;
