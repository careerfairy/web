import { sxStyles, useIsMobile } from "@careerfairy/shared-ui"
import { Box, SwipeableDrawer } from "@mui/material"
import { useAppDispatch, useAppSelector } from "hooks"
import {
   ActiveView,
   sidePanelSelector,
   toggleSidePanel,
} from "store/streamingAppSlice"
import { CTAPanel } from "./CTAPanel"
import { ChatPanel } from "./ChatPanel"
import { JobsPanel } from "./JobsPanel"
import { PollsPanel } from "./PollsPanel"
import { QAndAPanel } from "./QAndAPanel"
import { HandRaisePanel } from "./HandRaisePanel"

const drawerWidth = 328

const styles = sxStyles({
   root: {
      display: "flex",
      transition: (theme) => theme.transitions.create(["width", "opacity"]),
   },
   open: {
      width: drawerWidth,
      opacity: 1,
   },
   closed: {
      width: 0,
      opacity: 0,
   },
   paper: {
      borderRadius: "12px 12px 0 0",
      minHeight: "50vh",
      maxHeight: {
         xs: `calc(100vh - 140px)`,
         sm: `calc(100vh - 32px)`,
      },
   },
})

const viewComponents = {
   chat: <ChatPanel />,
   jobs: <JobsPanel />,
   polls: <PollsPanel />,
   quests: <QAndAPanel />,
   cta: <CTAPanel />,
   "hand-raise": <HandRaisePanel />,
   default: null,
} satisfies Record<ActiveView | "default", React.ReactNode>

type Props = {
   parentHeight: number
}

export const SidePanel = ({ parentHeight }: Props) => {
   const isMobile = useIsMobile()

   const dispatch = useAppDispatch()
   const { isOpen, activeView } = useAppSelector(sidePanelSelector)

   const handleToggle = () => {
      dispatch(toggleSidePanel())
   }

   const content = viewComponents[activeView] ?? viewComponents.default

   if (isMobile) {
      return (
         <SwipeableDrawer
            onOpen={handleToggle}
            onClose={handleToggle}
            open={isOpen}
            anchor="bottom"
            PaperProps={{
               sx: styles.paper,
            }}
         >
            {content}
         </SwipeableDrawer>
      )
   }

   return (
      <Box
         sx={[
            styles.root,
            isOpen ? styles.open : styles.closed,
            {
               maxHeight: parentHeight,
            },
         ]}
      >
         {content}
      </Box>
   )
}
