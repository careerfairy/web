import { Box, Slide } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import BrandedSwipeableDrawer from "components/views/common/inputs/BrandedSwipeableDrawer"
import { useCallback, useEffect, useRef, useState } from "react"
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
   mobileDrawerView: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
   },
   desktopViewContainer: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      pointerEvents: "auto",
   },
})

const mobileViews: RecordingPanelView[] = [
   "edit-details",
   "questions",
   "chat",
   "highlights",
   "chapters",
]

const allViews: RecordingPanelView[] = ["menu", ...mobileViews]

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
   const scrollContainerRef = useRef<HTMLDivElement | null>(null)
   const scrollPositionsRef = useRef<
      Partial<Record<RecordingPanelView, number>>
   >({})

   const storeScrollPosition = useCallback(() => {
      if (!isMobile) {
         return
      }

      const container = scrollContainerRef.current
      if (!container) {
         return
      }

      scrollPositionsRef.current[currentView] = container.scrollTop
   }, [currentView, isMobile])

   useEffect(() => {
      if (!isMobile || !isDrawerOpen) {
         return
      }

      const container = scrollContainerRef.current
      if (!container) {
         return
      }

      const storedPosition = scrollPositionsRef.current[currentView] ?? 0
      container.scrollTo({ top: storedPosition })
   }, [currentView, isDrawerOpen, isMobile])

   const handleNavigate = useCallback(
      (view: RecordingPanelView) => {
         if (isMobile) {
            storeScrollPosition()
         }

         setCurrentView(view)
         if (isMobile) {
            setIsDrawerOpen(true)
         }
      },
      [isMobile, storeScrollPosition]
   )

   const handleBack = useCallback(() => {
      if (isMobile) {
         storeScrollPosition()
         setIsDrawerOpen(false)
         return
      }

      setCurrentView("menu")
   }, [isMobile, storeScrollPosition])

   const handleDrawerClose = useCallback(() => {
      if (isMobile) {
         storeScrollPosition()
      }
      setIsDrawerOpen(false)
   }, [isMobile, storeScrollPosition])

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
               <Box sx={styles.drawerContent} ref={scrollContainerRef}>
                  {mobileViews.map((view) => (
                     <Box
                        key={view}
                        sx={[
                           styles.mobileDrawerView,
                           currentView !== view && { display: "none" },
                        ]}
                     >
                        {renderPanelView(view, {
                           handleBack,
                           handleNavigate,
                        })}
                     </Box>
                  ))}
               </Box>
            </BrandedSwipeableDrawer>
         </>
      )
   }

   return (
      <Box sx={styles.desktopContainer} ref={transitionContainerRef}>
         {allViews.map((view) => (
            <Box
               key={view}
               sx={[
                  styles.desktopViewContainer,
                  currentView !== view && { pointerEvents: "none" },
               ]}
            >
               <Slide
                  direction={view === "menu" ? "right" : "left"}
                  in={currentView === view}
                  mountOnEnter
                  timeout={100}
                  container={transitionContainerRef.current}
               >
                  <Box sx={styles.transitionItem}>
                     {renderPanelView(view, { handleBack, handleNavigate })}
                  </Box>
               </Slide>
            </Box>
         ))}
      </Box>
   )
}

export default RecordingRightPanel
