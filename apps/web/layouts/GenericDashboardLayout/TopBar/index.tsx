// material-ui
import { Box, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"

// project imports
import { useAuth } from "../../../HOCs/AuthProvider"
import useIsMobile from "../../../components/custom-hook/useIsMobile"
import {
   getMaxLineStyles,
   isServer,
} from "../../../components/helperFunctions/HelperFunctions"
import { MainLogo } from "../../../components/logos"
import LoginButton from "../../../components/views/common/LoginButton"
import MissingDataButton from "../../../components/views/missingData/MissingDataButton"
import { sxStyles } from "../../../types/commonTypes"
import Notifications from "./Notifications"
import ProfileMenu from "./ProfileMenu"

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
      minHeight: "70px",
   },
   leftSection: {
      display: "flex",
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

   return (
      <Box bgcolor={bgColor} sx={styles.root}>
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
            {authenticatedUser.isLoaded &&
            authenticatedUser.isEmpty &&
            !isServer() ? ( // fixes nextjs ssr hydration client error
               <div>
                  <LoginButton />
               </div>
            ) : (
               <>
                  <Notifications />
                  <ProfileMenu />
               </>
            )}
         </Stack>
      </Box>
   )
}

export default TopBar
