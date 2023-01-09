import { Box, Button, Typography } from "@mui/material"
import MenuRoundedIcon from "@mui/icons-material/MenuRounded"
import { sxStyles } from "../../types/commonTypes"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import IconButton from "@mui/material/IconButton"
import UserAvatarWithDetails from "./UserAvatarWithDetails"
import Stack from "@mui/material/Stack"
import NotificationsButton from "./NotificationsButton"

const styles = sxStyles({
   root: {
      display: "flex",
      flex: 1,
      alignItems: "center",
      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      px: 2,
      py: {
         xs: 1,
         md: 2,
      },
   },
   leftSection: {
      width: {
         xs: "auto",
         md: 228,
      },
      display: "flex",
   },
   menuButton: {
      borderRadius: 3,
      overflow: "hidden",
   },
   title: {
      fontSize: "2.6rem !important",
      fontFamily: "Poppins !important",
   },
   floatingButton: {
      position: "fixed",
      bottom: 20,
      right: 20,
   },
})

type Props = {
   drawerOpen: boolean
   handleLeftDrawerToggle: () => void
   title: string
}

const HeaderContent = ({
   handleLeftDrawerToggle,
   drawerOpen,
   title,
}: Props) => {
   const isMobile = useIsMobile()
   return (
      <Box sx={styles.root}>
         {/* toggler button */}
         <Box sx={styles.leftSection}>
            {!drawerOpen && (
               <Box>
                  <IconButton
                     onClick={handleLeftDrawerToggle}
                     sx={styles.menuButton}
                  >
                     <MenuRoundedIcon />
                  </IconButton>
               </Box>
            )}
            {!isMobile && (
               <Typography variant="h3" fontWeight={600} sx={styles.title}>
                  {title}
               </Typography>
            )}
         </Box>
         <Box sx={{ flexGrow: 1 }} />
         <Box sx={{ flexGrow: 1 }} />
         <Stack direction="row" alignItems="center" spacing={2}>
            <Button size={"small"} variant={"outlined"} color={"secondary"}>
               Create Live Stream
            </Button>
            {/* notification & profile */}
            <UserAvatarWithDetails />

            <NotificationsButton />
         </Stack>
      </Box>
   )
}

export default HeaderContent
