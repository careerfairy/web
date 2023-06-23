import { ComponentType, FC, useCallback, useState } from "react"
import SwipeableViews from "react-swipeable-views"
import { Dialog, DialogContent, useTheme } from "@mui/material"
import useIsMobile from "../../custom-hook/useIsMobile"
import { sxStyles } from "../../../types/commonTypes"
import { SlideLeftTransition, SlideUpTransition } from "../common/transitions"
import { NICE_SCROLLBAR_STYLES } from "../../../constants/layout"
import VideoView from "./VideoView"
import { AnimatedTabPanel } from "../../../materialUI/GlobalPanels/GlobalPanels"
import WelcomeView from "./WelcomeView"

const styles = sxStyles({
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      borderRadius: {
         md: 5,
      },
      overflow: "hidden",
      backgroundColor: "transparent",
   },
   content: {
      p: 0,
      display: "grid",
   },
   slide: {
      overflow: "overlay",
   },
   swipeableViewsContainer: {},
   fullHeight: {},
   swipeableViews: {},
})

type Props = {
   handleClose: () => void
   open: boolean
   fullScreen?: boolean
   initialViewIndex?: number
}

type ViewKey = "video" | "welcome"

type View = {
   key: ViewKey
   component: ComponentType
}

const WelcomeDialog: FC<Props> = ({
   handleClose,
   open,
   fullScreen,
   initialViewIndex,
}) => {
   const isMobile = useIsMobile()
   const [activeViewIndex, setActiveViewIndex] = useState<number>(
      initialViewIndex ?? 0
   )
   const theme = useTheme()

   const onVideoComplete = useCallback(() => {
      setActiveViewIndex(1)
   }, [])

   const views: View[] = [
      {
         key: "video",
         component: () => <VideoView onComplete={onVideoComplete} />,
      },
      {
         key: "welcome",
         component: () => <WelcomeView onClick={handleClose} />,
      },
   ]

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         TransitionComponent={
            isMobile ? SlideLeftTransition : SlideUpTransition
         }
         fullWidth
         fullScreen={fullScreen}
         closeAfterTransition={true}
         PaperProps={{
            sx: styles.dialogPaper,
         }}
      >
         <DialogContent sx={styles.content}>
            <SwipeableViews
               style={styles.swipeableViews}
               containerStyle={styles.swipeableViewsContainer}
               slideStyle={styles.slide}
               disabled
               axis={theme.direction === "rtl" ? "x-reverse" : "x"}
               index={activeViewIndex}
            >
               {views.map(({ key, component: View }, index) => (
                  <AnimatedTabPanel
                     sx={styles.fullHeight}
                     key={key}
                     value={index}
                     activeValue={activeViewIndex}
                  >
                     <View />
                  </AnimatedTabPanel>
               ))}
            </SwipeableViews>
         </DialogContent>
      </Dialog>
   )
}

export default WelcomeDialog
