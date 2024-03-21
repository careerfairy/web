import { sxStyles } from "types/commonTypes"
import { Box, SwipeableDrawer, Collapse } from "@mui/material"
import { useAppDispatch, useAppSelector } from "components/custom-hook/store"
import { ActiveView, toggleSidePanel } from "store/reducers/streamingAppReducer"
import { sidePanelSelector } from "store/selectors/streamingAppSelectors"
import { CTAPanel } from "./CTAPanel"
import { ChatPanel } from "./ChatPanel"
import { JobsPanel } from "./JobsPanel"
import { PollsPanel } from "./PollsPanel"
import { QAndAPanel } from "./QAndAPanel"
import { HandRaisePanel } from "./HandRaisePanel"
import { ReactNode } from "react"
import { useStreamIsMobile } from "components/custom-hook/streaming"
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
   const { isOpen, activeView } = useAppSelector(sidePanelSelector)

   const handleToggle = () => {
      dispatch(toggleSidePanel())
   }

   const content = viewComponents[activeView] ?? viewComponents.default

   const isMaxHeight = activeView === "viewers"

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
