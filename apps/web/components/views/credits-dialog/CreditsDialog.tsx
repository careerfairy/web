import React, {
   createContext,
   FC,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { Dialog, DialogContent } from "@mui/material"
import useIsMobile from "../../custom-hook/useIsMobile"
import { sxStyles } from "../../../types/commonTypes"
import SwipeableViews from "react-swipeable-views"
import { useTheme } from "@mui/material/styles"
import { AnimatedTabPanel } from "../../../materialUI/GlobalPanels/GlobalPanels"
import { useRouter } from "next/router"
import CVUploadView from "./views/CVUploadView"
import GetMoreCreditsView from "./views/GetMoreCreditsView"
import ReferFriendsView from "./views/ReferFriendsView"
import SwipeableDrawer from "@mui/material/SwipeableDrawer"
import { SlideUpTransition } from "../common/transitions"

const styles = sxStyles({
   content: {
      p: 0,
   },
   fullHeight: {
      height: "100%",
   },
   swipeableViews: {
      height: "100%",
   },
   swipeableViewsContainer: {
      height: "100%",
      "& > *": {
         height: "100%",
      },
   },
   almostFullHeight: (theme) => ({
      height: "calc(100% - 64px)",
      borderTopLeftRadius: `${theme.spacing(2)} !important`,
      borderTopRightRadius: `${theme.spacing(2)} !important`,
   }),
})

type Props = {
   open: boolean
   onClose: () => void
}

const CreditsDialog: FC<Props> = ({ onClose, open }) => {
   const isMobile = useIsMobile()

   const handleClose = useCallback(() => {
      onClose()
   }, [onClose])

   if (isMobile) {
      return (
         <SwipeableDrawer
            anchor="bottom"
            open={open}
            PaperProps={{
               sx: styles.almostFullHeight,
            }}
            onClose={handleClose}
            onOpen={() => {}}
            disableSwipeToOpen
            ModalProps={{
               keepMounted: false, // Does not mount the children when drawer is closed
            }}
         >
            <Content handleClose={handleClose} />
         </SwipeableDrawer>
      )
   }

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         maxWidth={"md"}
         fullWidth
         TransitionComponent={SlideUpTransition}
         keepMounted={false} // Does not mount the children when dialog is closed
      >
         <Content handleClose={handleClose} />
      </Dialog>
   )
}

const getMoreCreditsViewKey = 0
const cvViewKey = 1
const referFriendViewKey = 2

const views = [
   <GetMoreCreditsView key={getMoreCreditsViewKey} />,
   <CVUploadView key={cvViewKey} />,
   <ReferFriendsView key={referFriendViewKey} />,
] as const

type ViewStringKey = "GET_MORE_CREDITS" | "CV" | "REFER_FRIENDS"

type ContentProps = {
   handleClose: () => void
}
const Content: FC<ContentProps> = ({ handleClose }) => {
   const { push } = useRouter()

   const theme = useTheme()

   const [value, setValue] = useState(0)

   const handleGoToNextLivestreams = useCallback(() => {
      void push("/next-livestreams")
      handleClose()
   }, [handleClose, push])

   const handleGoToView = useCallback((view: ViewStringKey) => {
      switch (view) {
         case "GET_MORE_CREDITS":
            setValue(getMoreCreditsViewKey)
            break
         case "CV":
            setValue(cvViewKey)
            break
         case "REFER_FRIENDS":
            setValue(referFriendViewKey)
            break
         default:
            throw new Error("Invalid view")
      }
   }, [])

   const contextValue = useMemo<DialogContextType>(
      () => ({
         handleClose,
         handleGoToNextLivestreams,
         handleGoToView,
      }),
      [handleClose, handleGoToNextLivestreams, handleGoToView]
   )

   return (
      <DialogContext.Provider value={contextValue}>
         <DialogContent sx={styles.content}>
            <SwipeableViews
               style={styles.swipeableViews}
               containerStyle={styles.swipeableViewsContainer}
               disabled
               axis={theme.direction === "rtl" ? "x-reverse" : "x"}
               index={value}
            >
               {views.map((view, idx) => (
                  <AnimatedTabPanel
                     sx={styles.fullHeight}
                     key={idx}
                     value={idx}
                     activeValue={value}
                  >
                     {view}
                  </AnimatedTabPanel>
               ))}
            </SwipeableViews>
         </DialogContent>
      </DialogContext.Provider>
   )
}

type DialogContextType = {
   handleClose: () => void
   handleGoToNextLivestreams: () => void
   handleGoToView: (view: ViewStringKey) => void
}

const DialogContext = createContext<DialogContextType>({
   handleClose: () => {},
   handleGoToNextLivestreams: () => {},
   handleGoToView: () => {},
})

export const useCreditsDialogContext = () => {
   const context = useContext(DialogContext)
   if (!context) {
      throw new Error(
         "useCreditsDialogContext must be used within a DialogProvider"
      )
   }
   return context
}

export default CreditsDialog
