// material-ui
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import MenuRoundedIcon from "@mui/icons-material/MenuRounded"
import { Box, Typography } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"

// project imports
import { LoadingButton } from "@mui/lab"
import { alpha } from "@mui/material"
import { useLivestreamRouting } from "components/views/group/admin/events/useLivestreamRouting"
import { useRouter } from "next/router"
import { ReactNode } from "react"
import { useGroup } from ".."
import useIsMobile from "../../../components/custom-hook/useIsMobile"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"
import { sxStyles } from "../../../types/commonTypes"
import { useGroupDashboard } from "../GroupDashboardLayoutProvider"
import NotificationsButton from "./NotificationsButton"
import UserAvatarWithDetails from "./UserAvatarWithDetails"

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
         backdropFilter: "blur(8px)",
         backgroundColor: "rgba(247, 248, 252, 0.9)",
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
   mobileCta?: ReactNode
   navigation?: ReactNode
}

const TopBar = ({ title, cta, mobileCta, navigation }: Props) => {
   const { livestreamDialog } = useGroup()
   const isMobile = useIsMobile()
   const { layout } = useGroupDashboard()
   const { createDraftLivestream, isCreating, livestreamCreationFlowV2 } =
      useLivestreamRouting()

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
               ? mobileCta
               : cta || (
                    <LoadingButton
                       size={"large"}
                       variant={"outlined"}
                       color={"secondary"}
                       loading={isCreating}
                       onClick={() =>
                          livestreamCreationFlowV2
                             ? createDraftLivestream()
                             : livestreamDialog.handleOpenNewStreamModal()
                       }
                    >
                       Create New Live Stream
                    </LoadingButton>
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
