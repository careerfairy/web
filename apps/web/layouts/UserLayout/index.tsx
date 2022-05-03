import React, { FC, useEffect } from "react"
import Box from "@mui/material/Box"
import Page from "../../components/views/common/Page"
import GenericHeader from "../../components/views/header/GenericHeader"
import PersistentDrawer from "../../components/views/navbar/PersistentDrawer"
import useGeneralLinks from "../../components/custom-hook/useGeneralLinks"
import { useAuth } from "../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import { CircularProgress } from "@mui/material"

type Props = {}
const UserLayout: FC<Props> = ({ children }) => {
   const { secondaryLinks, mainLinks } = useGeneralLinks()
   const { authenticatedUser, isLoggedOut } = useAuth()
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

   if (!authenticatedUser.isLoaded || isLoggedOut) {
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
         <GenericHeader position={"sticky"} />
         <Box
            sx={{
               flex: "1 1 auto",
               height: "100%",
               overflow: "auto",
               display: "flex",
            }}
         >
            <PersistentDrawer
               drawerTopLinks={mainLinks}
               drawerBottomLinks={secondaryLinks}
            />
            <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 }, width: "100%" }}>
               {children}
            </Box>
         </Box>
      </Page>
   )
}

export default UserLayout
