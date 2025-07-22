// material-ui
import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import { AnimatePresence, motion } from "framer-motion"
import { useLockBodyScroll } from "react-use"

// project imports
import { useGroupDashboard } from "./GroupDashboardLayoutProvider"

// Reuse existing NavBar components
import { useAppSelector } from "components/custom-hook/store"
import { EditGroupCard } from "./EditGroupCard"
import { GroupBottomLinks } from "./GroupBottomLinks"
import { GroupNavList } from "./GroupNavList"

const MenuOverlay = styled(motion.div, {
   shouldForwardProp: (prop) => prop !== "bottomNavigationHeight",
})<{ bottomNavigationHeight: number }>(({ bottomNavigationHeight, theme }) => ({
   position: "fixed",
   top: 0,
   left: 0,
   right: 0,
   bottom: `${bottomNavigationHeight}px`,
   zIndex: theme.zIndex.modal,
}))

const MenuContent = styled(motion.div, {
   shouldForwardProp: (prop) => prop !== "bottomNavigationHeight",
})<{ bottomNavigationHeight: number }>({
   position: "absolute",
   top: 0,
   backdropFilter: "blur(45.4px)",
   right: 0,
   height: "100%",
   width: "100%",
   backgroundColor: "rgba(255, 255, 255, 0.95)",
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   alignSelf: "stretch",
   padding: "16px",
   overflow: "auto",
})

const StyledEditGroupCard = styled(EditGroupCard)(({ theme }) => ({
   padding: theme.spacing(0.5, 1),
   margin: 0,
   marginBottom: theme.spacing(2),
}))

const overlayVariants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1 },
}

const menuVariants = {
   hidden: { x: "100%" },
   visible: { x: "0%" },
}

const allowedLinkIds = ["talent-pool", "analytics", "company-profile"]

const overlayTransition = {
   duration: 0.3,
}

const menuTransition = {
   type: "spring",
   stiffness: 400,
   damping: 40,
   mass: 1,
}

type Props = {
   /**
    * The height of the bottom navigation bar, so the full screen menu can sit on top of it
    */
   bottomNavigationHeight: number
}

/**
 * MobileFullScreenMenu displays a collapsible navigation menu for mobile group dashboards,
 * overlaying the main content using MUI Collapse component.
 */
export const MobileFullScreenMenu = ({ bottomNavigationHeight }: Props) => {
   const { toggleMobileFullScreenMenu } = useGroupDashboard()

   const mobileFullScreenMenuOpen = useAppSelector(
      (state) => state.groupDashboardLayout.layout.mobileFullScreenMenuOpen
   )

   // Lock body scroll when menu is open
   useLockBodyScroll(mobileFullScreenMenuOpen)

   return (
      <AnimatePresence>
         {Boolean(mobileFullScreenMenuOpen) && (
            <MenuOverlay
               bottomNavigationHeight={bottomNavigationHeight}
               initial="hidden"
               animate="visible"
               exit="hidden"
               variants={overlayVariants}
               transition={overlayTransition}
               onClick={toggleMobileFullScreenMenu}
            >
               <MenuContent
                  bottomNavigationHeight={bottomNavigationHeight}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={menuVariants}
                  transition={menuTransition}
                  onClick={(e) => e.stopPropagation()}
               >
                  <StyledEditGroupCard />
                  <GroupNavList allowedLinkIds={allowedLinkIds} />
                  <Box flexGrow={1} />
                  <GroupBottomLinks />
               </MenuContent>
            </MenuOverlay>
         )}
      </AnimatePresence>
   )
}
