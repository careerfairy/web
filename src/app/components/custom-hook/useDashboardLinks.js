import React, { useEffect, useState } from "react";
import { isEmpty, isLoaded } from "react-redux-firebase";
import {
   Archive as PastStreamIcon,
   BarChart2 as AnalyticsIcon,
   Edit as EditGroupIcon,
   FileText as DraftStreamIcon,
   Film as StreamIcon,
   User as ProfileIcon,
   Users as RolesIcon,
} from "react-feather";
import { useAuth } from "../../HOCs/AuthProvider";

const initialHeaderLinks = [
   {
      href: `/next-livestreams`,
      title: "NEXT LIVE STREAMS",
   },
   {
      href: `/wishlist`,
      title: "WISHLIST",
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
];
const useDashboardLinks = (group) => {
   const { authenticatedUser } = useAuth();

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
      if (isLoaded(group) && !isEmpty(group)) {
         const baseHrefPath = "group";
         const baseParam = "[groupId]";
         setDrawerTopLinks([
            {
               href: `/${baseHrefPath}/${group.id}/admin/events`,
               icon: StreamIcon,
               title: "Events",
               basePath: `/${baseHrefPath}/${baseParam}/admin/events`,
            },
            {
               href: `/${baseHrefPath}/${group.id}/admin/edit`,
               icon: EditGroupIcon,
               title: "Edit Group Profile",
               basePath: `/${baseHrefPath}/${baseParam}/admin/edit`,
            },
            {
               href: `/${baseHrefPath}/${group.id}/admin/analytics`,
               icon: AnalyticsIcon,
               title: "Analytics",
               basePath: `/${baseHrefPath}/${baseParam}/admin/analytics`,
            },
            {
               href: `/${baseHrefPath}/${group.id}/admin/roles`,
               icon: RolesIcon,
               title: "Roles",
               basePath: `/${baseHrefPath}/${baseParam}/admin/roles`,
            },
         ]);
      } else {
         setDrawerTopLinks([]);
      }
   }, [group?.id]);

   return { drawerBottomLinks, drawerTopLinks, headerLinks };
};

export default useDashboardLinks;
