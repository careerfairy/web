// material-ui
import { Box, Button, Typography } from "@mui/material"
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
import { useGroupDashboard } from "../GroupDashboardLayoutProvider"
import { useGroup } from ".."

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
   floatingButton: {
      position: "fixed",
      bottom: 20,
      right: 20,
   },
})

type Props = {
   title: string
   cta?: React.ReactNode
}

const TopBar = ({ title, cta }: Props) => {
   const { livestreamDialog } = useGroup()
   const isMobile = useIsMobile()

   const { toggleLeftDrawer, layout } = useGroupDashboard()
   const drawerPresent = !isMobile && layout.leftDrawerOpen

   return (
      <Box sx={styles.root}>
         {/* toggler button */}
         {!drawerPresent && (
            <Box sx={styles.btnWrapper}>
               <IconButton
                  onClick={toggleLeftDrawer}
                  sx={styles.menuButton}
                  edge={"start"}
               >
                  <MenuRoundedIcon />
               </IconButton>
            </Box>
         )}
         <Box sx={styles.leftSection}>
            <Typography fontWeight={600} sx={styles.title}>
               {title}
            </Typography>
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
            {isMobile
               ? null
               : cta || (
                    <Button
                       onClick={() =>
                          livestreamDialog.handleOpenNewStreamModal()
                       }
                       size={"small"}
                       variant={"outlined"}
                       color={"secondary"}
                    >
                       Create New Live Stream
                    </Button>
                 )}
            {/* notification & profile */}
            <UserAvatarWithDetails />
            <NotificationsButton />
         </Stack>
      </Box>
   )
}

export default TopBar
