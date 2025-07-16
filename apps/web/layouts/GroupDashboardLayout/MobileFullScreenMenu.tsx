// material-ui
import { Box, Drawer, DrawerProps } from "@mui/material"
import { styled } from "@mui/material/styles"

// project imports
import { useGroupDashboard } from "./GroupDashboardLayoutProvider"

// Reuse existing NavBar components
import { useAppSelector } from "components/custom-hook/store"
import { EditGroupCard } from "./EditGroupCard"
import { GroupBottomLinks } from "./GroupBottomLinks"
import { GroupNavList } from "./GroupNavList"

const DrawerContent = styled(Box, {
   shouldForwardProp: (prop) => prop !== "bottomNavigationHeight",
})<{ bottomNavigationHeight: number }>(({ theme, bottomNavigationHeight }) => ({
   height: `calc(100vh - ${bottomNavigationHeight}px)`,
   backgroundColor: "rgba(255, 255, 255, 0.95)",
   backdropFilter: "blur(45.4px)",
   display: "flex",
   flexDirection: "column",
   pointerEvents: "auto", // Re-enable pointer events for menu content
   [theme.breakpoints.up("md")]: {
      display: "none",
   },
}))

const NavSection = styled(Box)({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   alignSelf: "stretch",
   padding: "16px",
   flex: 1,
})

const StyledEditGroupCard = styled(EditGroupCard)(({ theme }) => ({
   padding: theme.spacing(0.5, 1),
   margin: 0,
}))

const StyledDrawer = styled(Drawer)(({ theme }) => ({
   [theme.breakpoints.up("md")]: {
      display: "none",
   },
   display: "block",
   pointerEvents: "none",
}))

const ModalProps: DrawerProps["ModalProps"] = {
   keepMounted: true,
   disablePortal: true,
}

type Props = {
   /**
    * The height of the bottom navigation bar, so the full screen menu can sit on top of it
    */
   bottomNavigationHeight: number
}

/**
 * MobileFullScreenMenu displays a full-screen navigation drawer for mobile group dashboards,
 * overlaying the main content and sitting above the bottom navigation bar.
 */
export const MobileFullScreenMenu = ({ bottomNavigationHeight }: Props) => {
   const { toggleMobileFullScreenMenu } = useGroupDashboard()

   const mobileFullScreenMenuOpen = useAppSelector(
      (state) => state.groupDashboardLayout.layout.mobileFullScreenMenuOpen
   )

   return (
      <StyledDrawer
         anchor="right"
         open={mobileFullScreenMenuOpen}
         onClose={toggleMobileFullScreenMenu}
         hideBackdrop
         PaperProps={{
            sx: {
               top: 0,
               bottom: `${bottomNavigationHeight}px`,
               height: `calc(100vh - ${bottomNavigationHeight}px)`,
               width: "100%",
               boxShadow: "none",
            },
         }}
         ModalProps={ModalProps}
      >
         <DrawerContent bottomNavigationHeight={bottomNavigationHeight}>
            <NavSection>
               <StyledEditGroupCard sx={{ pb: 1 }} />
               <GroupNavList
                  allowedLinkIds={[
                     "talent-pool",
                     "analytics",
                     "company-profile",
                  ]}
               />
               <Box flexGrow={1} />
               <GroupBottomLinks />
            </NavSection>
         </DrawerContent>
      </StyledDrawer>
   )
}
