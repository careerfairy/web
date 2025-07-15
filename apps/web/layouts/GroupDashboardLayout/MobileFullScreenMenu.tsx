import { Fragment, useEffect } from "react"

// material-ui
import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"

// react-feather icons

// project imports
import { useGroupDashboard } from "./GroupDashboardLayoutProvider"

// Reuse existing NavBar components
import EditGroupCard from "./EditGroupCard"
import { GroupBottomLinks } from "./GroupBottomLinks"
import GroupNavList from "./GroupNavList"

const FullScreenOverlay = styled(Box)<{ bottomNavigationHeight: number }>(
   ({ theme, bottomNavigationHeight }) => ({
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: bottomNavigationHeight,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(45.4px)",
      zIndex: 1300,
      display: "flex",
      flexDirection: "column",
      [theme.breakpoints.up("md")]: {
         display: "none", // Hide on desktop
      },
   })
)

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

type Props = {
   bottomNavigationHeight: number
}

export const MobileFullScreenMenu = ({ bottomNavigationHeight }: Props) => {
   const { layout, toggleMobileFullScreenMenu } = useGroupDashboard()

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === "Escape") {
            toggleMobileFullScreenMenu()
         }
      }
      if (layout.mobileFullScreenMenuOpen) {
         window.addEventListener("keydown", handleKeyDown)
      }
      return () => {
         window.removeEventListener("keydown", handleKeyDown)
      }
   }, [layout.mobileFullScreenMenuOpen, toggleMobileFullScreenMenu])

   if (!layout.mobileFullScreenMenuOpen) {
      return null
   }

   return (
      <Fragment>
         <FullScreenOverlay bottomNavigationHeight={bottomNavigationHeight}>
            {/* Reuse existing NavBar components */}
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
         </FullScreenOverlay>
      </Fragment>
   )
}
