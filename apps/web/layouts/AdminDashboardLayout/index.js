import React, { useEffect, useMemo } from "react"
import NavBar from "./NavBar"
import { useAuth } from "../../HOCs/AuthProvider"
import { CircularProgress } from "@mui/material"
import useAdminLinks from "../../components/custom-hook/useAdminLinks"
import { useRouter } from "next/router"
import * as actions from "../../store/actions"
import { useDispatch } from "react-redux"
import GenericHeader from "../../components/views/header/GenericHeader"
import Page, {
   PageChildrenWrapper,
   PageContentWrapper,
} from "../../components/views/common/Page"
import useIsDesktop from "../../components/custom-hook/useIsDesktop"

const AdminDashboardLayout = (props) => {
   const { children } = props
   const dispatch = useDispatch()

   const isDesktop = useIsDesktop()
   const { userData, authenticatedUser } = useAuth()
   const { replace } = useRouter()
   const enqueueSnackbar = (...args) =>
      dispatch(actions.enqueueSnackbar(...args))

   const { headerLinks, drawerTopLinks, drawerBottomLinks } = useAdminLinks()

   useEffect(() => {
      ;(async function handleRedirect() {
         const unAuthorized =
            authenticatedUser.isLoaded &&
            (authenticatedUser.isEmpty ||
               (!authenticatedUser.isEmpty && userData && !userData.isAdmin))
         if (unAuthorized) {
            await replace("/")
            const message = "You do not have permission to visit this page"
            enqueueSnackbar({
               message,
               options: {
                  variant: "error",
                  preventDuplicate: true,
                  key: message,
               },
            })
         }
      })()
   }, [authenticatedUser, userData])

   const isAdmin = useMemo(() => userData?.isAdmin, [userData?.isAdmin])

   return (
      <Page>
         <GenericHeader position={"sticky"} />
         <PageContentWrapper sx={{ backgroundColor: "#F7F8FC" }}>
            {isAdmin && (
               <NavBar
                  drawerTopLinks={drawerTopLinks}
                  drawerBottomLinks={drawerBottomLinks}
                  headerLinks={headerLinks}
                  isDesktop={isDesktop}
               />
            )}
            <PageChildrenWrapper sx={{ overflow: "auto" }}>
               {isAdmin ? (
                  React.Children.map(children, (child) =>
                     React.cloneElement(child, {
                        isAdmin,
                        ...props,
                     })
                  )
               ) : (
                  <CircularProgress style={{ margin: "auto" }} />
               )}
            </PageChildrenWrapper>
         </PageContentWrapper>
      </Page>
   )
}

export default AdminDashboardLayout
