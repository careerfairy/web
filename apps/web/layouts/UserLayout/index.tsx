import React, { FC, useEffect } from "react"
import Page, {
   PageChildrenWrapper,
   PageContentWrapper,
} from "../../components/views/common/Page"
import GenericHeader from "../../components/views/header/GenericHeader"
import { useAuth } from "../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import { CircularProgress, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import GeneralNavDrawer from "../../components/views/navbar/GeneralNavDrawer"

type Props = {}
const desktopProp = "md"

const UserLayout: FC<Props> = ({ children }) => {
   const theme = useTheme()

   const isDesktop = useMediaQuery(theme.breakpoints.up(desktopProp), {
      noSsr: true,
   })

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
      <Page backgroundColor={"white"}>
         <GenericHeader position={"sticky"} />
         <PageContentWrapper>
            <GeneralNavDrawer isPersistent={isDesktop} />
            <PageChildrenWrapper padding>{children}</PageChildrenWrapper>
         </PageContentWrapper>
         <ScrollToTop />
      </Page>
   )
}

export default UserLayout
