import React, {
   createContext,
   FC,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { Dialog, DialogContent, Zoom } from "@mui/material"
import useIsMobile from "../../custom-hook/useIsMobile"
import { sxStyles } from "../../../types/commonTypes"
import SwipeableViews from "react-swipeable-views"
import { useTheme } from "@mui/material/styles"
import { AnimatedTabPanel } from "../../../materialUI/GlobalPanels/GlobalPanels"
import { useRouter } from "next/router"
import CVUploadView from "./views/CVUploadView"
import GetMoreCreditsView from "./views/GetMoreCreditsView"
import ReferFriendsView from "./views/ReferFriendsView"

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

   return (
      <Dialog
         fullScreen={isMobile}
         open={open}
         onClose={handleClose}
         maxWidth={"md"}
         fullWidth
         TransitionComponent={Zoom}
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

type ContentProps = {
   handleClose: () => void
}
const Content: FC<ContentProps> = ({ handleClose }) => {
   const { push } = useRouter()

   const theme = useTheme()

   const [value, setValue] = useState(0)

   const handleGoToGetMoreCreditsView = useCallback(() => {
      setValue(getMoreCreditsViewKey)
   }, [])

   const handleGoToCVView = useCallback(() => {
      setValue(cvViewKey)
   }, [])

   const handleGoToReferFriendView = useCallback(() => {
      setValue(referFriendViewKey)
   }, [])

   const handleGoToNextLivestreams = useCallback(() => {
      void push("/next-livestreams")
      handleClose()
   }, [handleClose, push])

   const contextValue = useMemo<DialogContextType>(
      () => ({
         handleClose,
         handleGoToReferFriendView,
         handleGoToCVView,
         handleGoToGetMoreCreditsView,
         handleGoToNextLivestreams,
      }),
      [
         handleClose,
         handleGoToCVView,
         handleGoToGetMoreCreditsView,
         handleGoToNextLivestreams,
         handleGoToReferFriendView,
      ]
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
   handleGoToCVView: () => void
   handleGoToNextLivestreams: () => void
   handleGoToReferFriendView: () => void
   handleGoToGetMoreCreditsView: () => void
}

const DialogContext = createContext<DialogContextType>({
   handleClose: () => {},
   handleGoToCVView: () => {},
   handleGoToNextLivestreams: () => {},
   handleGoToReferFriendView: () => {},
   handleGoToGetMoreCreditsView: () => {},
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
