// material-ui
import { Box, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"

// project imports
import { sxStyles } from "../../../types/commonTypes"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"
import UserAvatar from "./UserAvatar"
import LoginButton from "../../../components/views/common/LoginButton"
import { useAuth } from "../../../HOCs/AuthProvider"
import useIsMobile from "../../../components/custom-hook/useIsMobile"
import { MainLogo } from "../../../components/logos"
import React from "react"
import { useGenericDashboard } from "../index"
import MissingDataButton from "../../../components/views/missingData/MissingDataButton"

const styles = sxStyles({
   root: {
      display: "flex",
      width: "100%",
      flex: 1,
      alignItems: "center",
      px: {
         xs: 2,
         sm: 5,
      },
      py: 1,
   },
   leftSection: {
      display: "flex",
   },
   btnWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mr: 1,
   },
   menuButton: {
      borderRadius: 3,
      overflow: "hidden",
   },
   title: {
      fontSize: {
         xs: "1.2rem",
         sm: "2rem",
      },
      ...getMaxLineStyles(1),
   },
})

type Props = {
   title: string
   bgColor?: string
}

const TopBar = ({ title, bgColor }: Props) => {
   const { authenticatedUser } = useAuth()
   const isMobile = useIsMobile()
   const { isOverBanner } = useGenericDashboard()

   return (
      <Box
         bgcolor={isOverBanner ? null : bgColor || "#F7F8FC"}
         sx={styles.root}
      >
         <Box sx={styles.leftSection}>
            {isMobile ? (
               <MainLogo sx={{ maxWidth: "100%" }} />
            ) : (
               <Typography variant={"h1"} fontWeight={600} sx={styles.title}>
                  {title}
               </Typography>
            )}
         </Box>
         <Box sx={{ flexGrow: 1 }} />
         <Stack
            direction="row"
            alignItems="center"
            spacing={{
               xs: 1,
               md: 3,
            }}
         >
            <MissingDataButton />

            {/* profile avatar */}
            {authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
               <div>
                  <LoginButton />
               </div>
            ) : (
               <UserAvatar />
            )}
         </Stack>
      </Box>
   )
}

export default TopBar
