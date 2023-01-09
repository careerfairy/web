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
}

const TopBar = ({ handleLeftDrawerToggle, title }: Props) => {
   const isMobile = useIsMobile()

   return (
      <Box sx={styles.root}>
         {/* toggler button */}
         <Box sx={styles.leftSection}>
            <Box sx={styles.btnWrapper}>
               <IconButton
                  onClick={handleLeftDrawerToggle}
                  sx={styles.menuButton}
               >
                  <MenuRoundedIcon />
               </IconButton>
            </Box>
            {!isMobile && (
               <Typography variant="h3" fontWeight={600} sx={styles.title}>
                  {title}
               </Typography>
            )}
         </Box>
         <Box sx={{ flexGrow: 1 }} />
         <Stack direction="row" alignItems="center" spacing={2}>
            {/* TODO: ADD OPENING OF STREAM CREATION DIALOG */}
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
