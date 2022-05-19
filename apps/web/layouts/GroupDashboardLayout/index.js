import PropTypes from "prop-types"
import React, { useMemo, useRef } from "react"
import NavBar from "./NavBar"
import { useRouter } from "next/router"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import { useAuth } from "../../HOCs/AuthProvider"
import { isEmpty, isLoaded } from "react-redux-firebase"
import { useSelector } from "react-redux"
import TopBar from "./TopBar"
import useDashboardRedirect from "../../components/custom-hook/useDashboardRedirect"
import useAdminGroup from "../../components/custom-hook/useAdminGroup"
import useDashboardLinks from "../../components/custom-hook/useDashboardLinks"
import { CircularProgress, Typography } from "@mui/material"
import Page, {
   PageChildrenWrapper,
   PageContentWrapper,
} from "../../components/views/common/Page"
import useIsDesktop from "../../components/custom-hook/useIsDesktop"

const GroupDashboardLayout = (props) => {
   const firebase = useFirebaseService()
   const { children } = props
   const scrollRef = useRef(null)

   const isDesktop = useIsDesktop()
   const {
      query: { groupId },
   } = useRouter()
   const { userData, authenticatedUser } = useAuth()
   const notifications = useSelector(
      ({ firestore }) => firestore.ordered.notifications || []
   )

   const group = useAdminGroup(groupId)
   useDashboardRedirect(group, firebase)

   const { headerLinks, drawerTopLinks, drawerBottomLinks } =
      useDashboardLinks(group)

   const isAdmin = useMemo(
      () =>
         userData?.isAdmin ||
         group?.adminEmails?.includes(authenticatedUser?.email),
      [userData?.isAdmin, group?.adminEmails, authenticatedUser?.email]
   )
   const isCorrectGroup = useMemo(
      () => groupId === group?.groupId,
      [groupId, group?.groupId]
   )

   return (
      <Page>
         <TopBar notifications={notifications} />
         <PageContentWrapper>
            {isLoaded(group) && !isEmpty(group) && (
               <NavBar
                  drawerTopLinks={drawerTopLinks}
                  drawerBottomLinks={drawerBottomLinks}
                  headerLinks={headerLinks}
                  group={group}
                  isDesktop={isDesktop}
               />
            )}
            <PageChildrenWrapper>
               {!isLoaded(group) ? (
                  <CircularProgress sx={{ margin: "auto" }} />
               ) : isEmpty(group) || !isCorrectGroup ? (
                  <Typography variant={"h6"} sx={{ margin: "auto" }}>
                     Group not found
                  </Typography>
               ) : (
                  React.Children.map(children, (child) =>
                     React.cloneElement(child, {
                        notifications,
                        isAdmin,
                        scrollRef,
                        group,
                        ...props,
                     })
                  )
               )}
            </PageChildrenWrapper>
         </PageContentWrapper>
      </Page>
   )
}

GroupDashboardLayout.propTypes = {
   children: PropTypes.node.isRequired,
}

GroupDashboardLayout.defaultProps = {}
export default GroupDashboardLayout
