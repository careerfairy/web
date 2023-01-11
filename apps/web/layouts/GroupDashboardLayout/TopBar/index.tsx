// material-ui
import { Box, Typography } from "@mui/material"
import MenuRoundedIcon from "@mui/icons-material/MenuRounded"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"

// project imports
import { sxStyles } from "../../../types/commonTypes"
import useIsMobile from "../../../components/custom-hook/useIsMobile"
import UserAvatarWithDetails from "./UserAvatarWithDetails"
import NotificationsButton from "./NotificationsButton"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"
import { alpha } from "@mui/material/styles"

const styles = sxStyles({
   root: {
      display: "flex",
      flex: 1,
      alignItems: "center",
      borderBottom: (theme) =>
         `2px solid ${alpha(theme.palette.divider, 0.03)}`,
      px: {
         xs: 2,
         sm: 5,
      },
      py: {
         xs: 1,
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
      fontSize: "36px !important",
      ...getMaxLineStyles(1),
   },
   floatingButton: {
      position: "fixed",
      bottom: 20,
      right: 20,
   },
})

type Props = {
   handleLeftDrawerToggle: () => void
   title: string
   drawerOpened: boolean
}

const TopBar = ({ handleLeftDrawerToggle, title, drawerOpened }: Props) => {
   const isMobile = useIsMobile()

   const drawerPresent = !isMobile && drawerOpened

   return (
      <Box sx={styles.root}>
         {/* toggler button */}
         {!drawerPresent && (
            <Box sx={styles.btnWrapper}>
               <IconButton
                  onClick={handleLeftDrawerToggle}
                  sx={styles.menuButton}
                  edge={"start"}
               >
                  <MenuRoundedIcon />
               </IconButton>
            </Box>
         )}
         <Box sx={styles.leftSection}>
            {!isMobile && (
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
            {/* TODO: RENDER THIS BUTTON FOR THE LANDING PAGE */}
            {/*<Button size={"small"} variant={"outlined"} color={"secondary"}>*/}
            {/*   Create Live Stream*/}
            {/*</Button>*/}

            {/* notification & profile */}
            <UserAvatarWithDetails />

            <NotificationsButton />
         </Stack>
      </Box>
   )
}

export default TopBar
