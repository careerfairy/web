// material-ui
import { Box, Button, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"

// project imports
import { useRouter } from "next/router"
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
         sm: 4,
      },
      py: 1.5,
      background: "#F7F8FC",
   },
   leftSection: {
      display: "flex",
   },
   rightSection: {
      alignItems: "center",
   },
   loginButton: {
      color: (theme) => `${theme.palette.neutral[500]} !important`,
   },
   signUpButton: {
      textWrap: "noWrap",
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
   const { asPath } = useRouter()

   const SignUpButton = () => (
      <Button
         variant="contained"
         href={`/signup?absolutePath=${asPath}`}
         color="primary"
         sx={styles.signUpButton}
         fullWidth
      >
         Sign up
      </Button>
   )

   return (
      <Box sx={styles.root}>
         <Box sx={styles.leftSection}>
            {isMobile ? (
               <MainLogo sx={{ maxWidth: "120px" }} />
            ) : (
               <Typography variant={"h1"} fontWeight={600} sx={styles.title}>
                  {title}
               </Typography>
            )}
         </Box>
         <Box sx={{ flexGrow: 1 }} />
         <Stack spacing={1} direction={"row"} sx={styles.rightSection}>
            <MissingDataButton />

            {/* profile avatar */}
            {authenticatedUser.isLoaded &&
            authenticatedUser.isEmpty &&
            !isServer() ? ( // fixes nextjs ssr hydration client error
               <Stack direction={"row"} spacing={0.5}>
                  <LoginButton variant="text" sx={styles.loginButton} />
                  <SignUpButton />
               </Stack>
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
