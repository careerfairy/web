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

const UserLayout: FC = ({ children }) => {
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
            }}
         >
            <CircularProgress />
         </Page>
      )
   }

   return (
      <>
         <GenericDashboardLayout pageDisplayName={""}>
            <PageContentWrapper>
               <PageChildrenWrapper>{children}</PageChildrenWrapper>
            </PageContentWrapper>
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
   )
}

export default UserLayout
