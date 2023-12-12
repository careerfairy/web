import React, { FC, useEffect } from "react"
import Page, {
   PageChildrenWrapper,
   PageContentWrapper,
} from "../../components/views/common/Page"
import { useAuth } from "../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import { CircularProgress } from "@mui/material"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import GenericDashboardLayout from "../GenericDashboardLayout"

const UserLayout: FC<{
   children: React.ReactNode
}> = ({ children }) => {
   const { authenticatedUser, isLoggedOut, userData } = useAuth()
   const { push, asPath } = useRouter()

   useEffect(() => {
      if (isLoggedOut) {
         void push({
            pathname: "/login",
            query: {
               absolutePath: asPath,
            },
         })
      }
   }, [isLoggedOut])

   if (!authenticatedUser.isLoaded || isLoggedOut || !userData) {
      return (
         <Page
            sx={{
               justifyContent: "center",
               alignItems: "center",

               /**
                * This is a hack to prevent layout shift.
                * The spinner is detached from the state cycle, causing both the spinner and the layout to render simultaneously.
                * Ideally, if there's an early return (like the spinner), the layout shouldn't be rendered.
                * This change ensures that the layout is rendered on top of the spinner, not pushed down by it.
                */
               position: "fixed",
               width: "100%",
               zIndex: -1,
            }}
         >
            <CircularProgress id={"auth-loading-spinner"} />
         </Page>
      )
   }

   return (
      <>
         <GenericDashboardLayout bgColor="white" pageDisplayName={""}>
            <PageContentWrapper>
               <PageChildrenWrapper>{children}</PageChildrenWrapper>
            </PageContentWrapper>
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
   )
}

export default UserLayout
