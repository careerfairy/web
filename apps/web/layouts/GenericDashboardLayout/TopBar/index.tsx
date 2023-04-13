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

const styles = sxStyles({
   root: {
      display: "flex",
      flex: 1,
      alignItems: "center",
      px: {
         xs: 2,
         sm: 5,
      },
      py: {
         xs: 0,
         md: 3.2,
      },
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
}

const TopBar = ({ title }: Props) => {
   const { authenticatedUser } = useAuth()
   const isMobile = useIsMobile()

   return (
      <Box sx={styles.root}>
         <Box sx={styles.leftSection}>
            {isMobile ? (
               <MainLogo sx={{ maxWidth: "100%" }} />
            ) : (
               <Typography fontWeight={600} sx={styles.title}>
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
