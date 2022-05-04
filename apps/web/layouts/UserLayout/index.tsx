import React, { FC, useEffect } from "react"
import Box from "@mui/material/Box"
import Page from "../../components/views/common/Page"
import GenericHeader from "../../components/views/header/GenericHeader"
import PersistentDrawer from "../../components/views/navbar/PersistentDrawer"
import { useAuth } from "../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import { CircularProgress, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"

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
      <Page>
         <GenericHeader isDesktop={isDesktop} position={"sticky"} />
         <Box
            sx={{
               flex: "1 1 auto",
               height: "100%",
               overflow: "auto",
               display: "flex",
            }}
         >
            <PersistentDrawer isDesktop={isDesktop} />
            <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 }, width: "100%" }}>
               {children}
            </Box>
         </Box>
      </Page>
   )
}

export default UserLayout
