// material-ui
import { Box, Button, Typography } from "@mui/material"
import MenuRoundedIcon from "@mui/icons-material/MenuRounded"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"

// project imports
import { sxStyles } from "../../../types/commonTypes"
import useIsMobile from "../../../components/custom-hook/useIsMobile"
import UserAvatarWithDetails from "./UserAvatarWithDetails"
import NotificationsButton from "./NotificationsButton"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"
import { alpha } from "@mui/material/styles"
import { useGroupDashboard } from "../GroupDashboardLayoutProvider"
import { useGroup } from ".."
import { ReactNode } from "react"
import { useRouter } from "next/router"

const getStyles = (hasNavigationBar?: boolean) =>
   sxStyles({
      root: {
         display: "flex",
         flexWrap: "wrap",
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
         paddingBottom: hasNavigationBar ? "0 !important" : "initial",
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
   title: ReactNode
   cta?: ReactNode
   navigation?: ReactNode
}

const TopBar = ({ title, cta, navigation }: Props) => {
   const { livestreamDialog } = useGroup()
   const isMobile = useIsMobile()
   const { layout } = useGroupDashboard()

   const drawerPresent = !isMobile && layout.leftDrawerOpen

   const styles = getStyles(Boolean(navigation))

   return (
      <Box sx={styles.root}>
         {/* toggler button */}
         {!drawerPresent ? <MobileToggleButton /> : null}
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
                       size={"large"}
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
         {Boolean(navigation) && navigation}
      </Box>
   )
}

const MobileToggleButton = () => {
   const { toggleLeftDrawer } = useGroupDashboard()
   const styles = getStyles()

   return (
      <Box sx={styles.btnWrapper}>
         <IconButton
            onClick={toggleLeftDrawer}
            sx={styles.menuButton}
            edge={"start"}
         >
            <MenuRoundedIcon />
         </IconButton>
      </Box>
   )
}

export const BackLink = ({ children }: { children: ReactNode }) => {
   const router = useRouter()

   return (
      <Box
         sx={{
            cursor: "pointer",
         }}
         onClick={() => {
            router.back()
         }}
      >
         <ArrowBackIosIcon />
         {children}
      </Box>
   )
}

export default TopBar
