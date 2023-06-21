import {
   ComponentType,
   createContext,
   FC,
   useContext,
   useMemo,
   useState,
} from "react"
import SwipeableViews from "react-swipeable-views"
import { Dialog, DialogContent, useTheme } from "@mui/material"
import useIsMobile from "../../custom-hook/useIsMobile"
import { sxStyles } from "../../../types/commonTypes"
import { SlideLeftTransition, SlideUpTransition } from "../common/transitions"
import { NICE_SCROLLBAR_STYLES } from "../../../constants/layout"
import VideoView from "./VideoView"
import { AnimatedTabPanel } from "../../../materialUI/GlobalPanels/GlobalPanels"

const styles = sxStyles({
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      borderRadius: {
         md: 5,
      },
      maxWidth: 915,
      height: "100%",
   },
   content: {
      p: 0,
      display: "grid",
   },
   slide: {
      overflow: "overlay",
   },
   swipeableViewsContainer: {
      height: "100%",
      "& > *": {
         height: "100%",
      },
   },
   fullHeight: {
      height: "100%",
   },
   swipeableViews: {
      height: "100%",
   },
})

type Props = {
   handleClose: () => void
   open: boolean
}

type ViewKey = "video" | "welcome"

type View = {
   key: ViewKey
   component: ComponentType
}

const views: View[] = [
   {
      key: "video",
      component: () => <VideoView />,
   },
]

const WelcomeDialog: FC<Props> = ({ handleClose, open }) => {
   const isMobile = useIsMobile()
   const [activeView, setActiveView] = useState<ViewKey>("video")
   const theme = useTheme()
   const contextValue = useMemo<WelcomeDialogContextType>(
      () => ({
         activeView,
         goToView: setActiveView,
         closeDialog: handleClose,
      }),
      [activeView, handleClose]
   )

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         TransitionComponent={
            isMobile ? SlideLeftTransition : SlideUpTransition
         }
         maxWidth="md"
         fullWidth
         fullScreen={isMobile}
         closeAfterTransition={true}
         PaperProps={{
            sx: styles.dialogPaper,
         }}
      >
         <DialogContent sx={styles.content}>
            <WelcomeDialogContext.Provider value={contextValue}>
               <SwipeableViews
                  style={styles.swipeableViews}
                  containerStyle={styles.swipeableViewsContainer}
                  slideStyle={styles.slide}
                  disabled
                  axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                  index={activeView}
               >
                  {views.map(({ key, component: View }, index) => (
                     <AnimatedTabPanel
                        sx={styles.fullHeight}
                        key={key}
                        value={index}
                        activeValue={activeView}
                     >
                        <View />
                     </AnimatedTabPanel>
                  ))}
               </SwipeableViews>
            </WelcomeDialogContext.Provider>
         </DialogContent>
      </Dialog>
   )
}

type WelcomeDialogContextType = {
   goToView: (view: ViewKey) => void
   closeDialog: () => void
   activeView: ViewKey
}

const WelcomeDialogContext = createContext<WelcomeDialogContextType>({
   closeDialog: () => {},
   goToView: () => {},
   activeView: "video",
})

export const useWelcomeDialog = () => {
   const context = useContext(WelcomeDialogContext)
   if (!context) {
      throw new Error(
         "useWelcomeDialog must be used within a WelcomeDialogProvider"
      )
   }
   return context
}

export default WelcomeDialog
