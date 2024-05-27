import { Box, Collapse, SwipeableDrawer } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { ReactNode } from "react"
import {
   ActiveView,
   ActiveViews,
   toggleSidePanel,
} from "store/reducers/streamingAppReducer"
import { useSidePanel } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { CTAPanel } from "./CTAPanel"
import { ChatPanel } from "./ChatPanel"
import { HandRaisePanel } from "./HandRaisePanel"
import { JobsPanel } from "./JobsPanel"
import { PollsPanel } from "./PollsPanel"
import { QAndAPanel } from "./QAndAPanel"
import { ViewersPanel } from "./ViewersPanel"

const drawerWidth = 328

const styles = sxStyles({
   root: {
      display: "flex",
      width: drawerWidth,
      height: "100%",
      opacity: 0,
      transition: (theme) => theme.transitions.create("opacity"),
   },
   open: {
      opacity: 1,
   },
   paper: {
      borderRadius: "12px 12px 0 0",
      minHeight: "50vh",
      maxHeight: {
         xs: `calc(100vh - 140px)`,
         sm: `calc(100vh - 32px)`,
      },
   },
   paperMaxHeight: {
      height: "100%",
   },
})

const viewComponents = {
   chat: <ChatPanel />,
   jobs: <JobsPanel />,
   polls: <PollsPanel />,
   questions: <QAndAPanel />,
   cta: <CTAPanel />,
   handRaise: <HandRaisePanel />,
   viewers: <ViewersPanel />,
   default: null,
} satisfies Record<ActiveView | "default", ReactNode>

export const SidePanel = () => {
   const isMobile = useStreamIsMobile()

   const dispatch = useAppDispatch()
   const { isOpen, activeView } = useSidePanel()

   const handleToggle = () => {
      dispatch(toggleSidePanel())
   }

   const content = viewComponents[activeView] ?? viewComponents.default

   const isMaxHeight =
      activeView === ActiveViews.VIEWERS ||
      activeView === ActiveViews.HAND_RAISE

   if (isMobile) {
      return (
         <SwipeableDrawer
            onOpen={handleToggle}
            onClose={handleToggle}
            open={isOpen}
            anchor="bottom"
            PaperProps={{
               sx: [styles.paper, isMaxHeight && styles.paperMaxHeight],
            }}
         >
            {content}
         </SwipeableDrawer>
      )
   }

   return (
      <Collapse in={isOpen} orientation="horizontal">
         <Box sx={[styles.root, isOpen && styles.open]}>{content}</Box>
      </Collapse>
   )
}
