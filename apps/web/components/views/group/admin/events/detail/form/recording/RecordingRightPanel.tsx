import { Box, Slide } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import BrandedSwipeableDrawer from "components/views/common/inputs/BrandedSwipeableDrawer"
import { useCallback, useRef, useState } from "react"
import { SwitchTransition } from "react-transition-group"
import { sxStyles } from "types/commonTypes"
import { ChaptersView } from "./views/ChaptersView"
import { ChatView } from "./views/ChatView"
import { EditDetailsView } from "./views/EditDetailsView"
import { HighlightsView } from "./views/HighlightsView"
import { MenuView, RecordingPanelView } from "./views/MenuView"
import { QuestionsView } from "./views/QuestionsView"

const styles = sxStyles({
   desktopContainer: {
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "100%",
   },
   transitionItem: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "overlay",
   },
   drawer: {
      "& .MuiPaper-root": {
         maxHeight: "90vh",
         display: "flex",
         flexDirection: "column",
      },
   },
   drawerContent: {
      flex: 1,
      overflow: "auto",
      display: "flex",
      flexDirection: "column",
      m: 1.5,
   },
})

type RenderViewHandlers = {
   handleBack: () => void
   handleNavigate: (view: RecordingPanelView) => void
}

const renderPanelView = (
   view: RecordingPanelView,
   handlers: RenderViewHandlers
): React.ReactNode => {
   switch (view) {
      case "menu":
         return <MenuView onNavigate={handlers.handleNavigate} />
      case "edit-details":
         return <EditDetailsView onBack={handlers.handleBack} />
      case "questions":
         return <QuestionsView onBack={handlers.handleBack} />
      case "chat":
         return <ChatView onBack={handlers.handleBack} />
      case "highlights":
         return <HighlightsView onBack={handlers.handleBack} />
      case "chapters":
         return <ChaptersView onBack={handlers.handleBack} />
      default:
         return null
   }
}

export const RecordingRightPanel = () => {
   const isMobile = useIsMobile()
   const [currentView, setCurrentView] = useState<RecordingPanelView>("menu")
   const [isDrawerOpen, setIsDrawerOpen] = useState(false)
   const transitionContainerRef = useRef<HTMLDivElement | null>(null)

   const handleNavigate = useCallback(
      (view: RecordingPanelView) => {
         setCurrentView(view)
         if (isMobile) {
            setIsDrawerOpen(true)
         }
      },
      [isMobile]
   )

   const handleBack = useCallback(() => {
      if (isMobile) {
         setIsDrawerOpen(false)
      }
      setCurrentView("menu")
   }, [isMobile])

   const handleDrawerClose = useCallback(() => {
      setIsDrawerOpen(false)
      setCurrentView("menu")
   }, [])

   const transitionDirection = currentView !== "menu" ? "left" : "right"

   if (isMobile) {
      return (
         <>
            <MenuView onNavigate={handleNavigate} />
            <BrandedSwipeableDrawer
               anchor="bottom"
               open={isDrawerOpen}
               onClose={handleDrawerClose}
               onOpen={() => null}
               sx={styles.drawer}
               hideDragHandle
            >
               <Box sx={styles.drawerContent}>
                  {renderPanelView(currentView, {
                     handleBack,
                     handleNavigate,
                  })}
               </Box>
            </BrandedSwipeableDrawer>
         </>
      )
   }

   return (
      <Box sx={styles.desktopContainer} ref={transitionContainerRef}>
         <SwitchTransition mode="out-in">
            <Slide
               key={currentView}
               direction={transitionDirection}
               mountOnEnter
               unmountOnExit
               timeout={100}
               container={transitionContainerRef.current}
            >
               <Box sx={styles.transitionItem}>
                  {renderPanelView(currentView, { handleBack, handleNavigate })}
               </Box>
            </Slide>
         </SwitchTransition>
      </Box>
   )
}

export default RecordingRightPanel
