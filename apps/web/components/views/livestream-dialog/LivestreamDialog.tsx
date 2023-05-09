import {
   createContext,
   FC,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useLivestream from "../../custom-hook/live-stream/useLivestream"
import { Dialog, DialogContent, Slide } from "@mui/material"
import useIsMobile from "../../custom-hook/useIsMobile"
import LivestreamDetailsView from "./views/LivestreamDetailsView"
import RegisterDataConsentView from "./views/RegisterDataConsentView"
import RegisterAskQuestionsView from "./views/RegisterAskQuestionsView"
import RegisterJoinTalentPoolView from "./views/RegisterJoinTalentPoolView"
import RegisterSuccessView from "./views/RegisterSuccessView"
import JobDetailsView from "./views/JobDetailsView"
import { sxStyles } from "../../../types/commonTypes"
import SwipeableViews from "react-swipeable-views"
import { useTheme } from "@mui/material/styles"
import { AnimatedTabPanel } from "../../../materialUI/GlobalPanels/GlobalPanels"

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
   serverSideLivestream: LivestreamEvent
   handleClose: () => void
   open: boolean
   page: "details" | "register" | "job-details"
   jobId?: string
}

const views = [
   { key: "livestream-details", component: LivestreamDetailsView },
   { key: "register-data-consent", component: RegisterDataConsentView },
   { key: "register-ask-questions", component: RegisterAskQuestionsView },
   { key: "register-join-talent-pool", component: RegisterJoinTalentPoolView },
   { key: "register-success", component: RegisterSuccessView },
   { key: "job-details", component: JobDetailsView },
] as const

type ViewKey = typeof views[number]["key"]

const LivestreamDialog: FC<Props> = ({ handleClose, open, ...rest }) => {
   const isMobile = useIsMobile()

   const onClose = useCallback(() => {
      handleClose()
   }, [handleClose])

   return (
      <Dialog
         open={open}
         onClose={onClose}
         TransitionComponent={Slide}
         maxWidth="lg"
         fullWidth
         fullScreen={isMobile}
      >
         <Content handleClose={onClose} {...rest} />
      </Dialog>
   )
}

type ContentProps = Omit<Props, "open">
const Content: FC<ContentProps> = ({
   handleClose,
   serverSideLivestream,
   page = "details",
   jobId,
}) => {
   const theme = useTheme()

   const [value, setValue] = useState<number>(getValue(page))

   const { data: livestream } = useLivestream(
      serverSideLivestream.id,
      serverSideLivestream
   )

   const goToView = useCallback((view: ViewKey) => {
      setValue(views.findIndex((v) => v.key === view))
   }, [])

   const onClose = useCallback(() => {
      handleClose()
   }, [handleClose])

   const contextValue = useMemo<DialogContextType>(
      () => ({
         goToView,
         closeDialog: onClose,
         livestream,
         activeView: views[value].key,
         jobId,
      }),
      [goToView, onClose, livestream, value, jobId]
   )

   return (
      <DialogContext.Provider value={contextValue}>
         <DialogContent sx={styles.content}>
            {livestream?.title}
            <SwipeableViews
               style={styles.swipeableViews}
               containerStyle={styles.swipeableViewsContainer}
               disabled
               axis={theme.direction === "rtl" ? "x-reverse" : "x"}
               index={value}
            >
               {views.map(({ key, component: View }, index) => (
                  <AnimatedTabPanel
                     sx={styles.fullHeight}
                     key={key}
                     value={index}
                     activeValue={value}
                  >
                     <View />
                  </AnimatedTabPanel>
               ))}
            </SwipeableViews>
         </DialogContent>
      </DialogContext.Provider>
   )
}

type DialogContextType = {
   goToView: (view: ViewKey) => void
   closeDialog: () => void
   /*
    * Undefined -> loading
    * Null -> no livestream
    * */
   livestream: LivestreamEvent | undefined | null
   activeView: ViewKey
   jobId?: string // Only for job-details view
}

const getValue = (page: Props["page"]): number => {
   switch (page) {
      case "details":
         return views.findIndex((view) => view.key === "livestream-details")
      case "register":
         return views.findIndex((view) => view.key === "register-data-consent")
      case "job-details":
         return views.findIndex((view) => view.key === "job-details")
   }
}

const DialogContext = createContext<DialogContextType>({
   closeDialog: () => {},
   goToView: () => {},
   livestream: undefined,
   activeView: "livestream-details",
})

export const useLiveStreamDialog = () => {
   const context = useContext(DialogContext)
   if (!context) {
      throw new Error(
         "useLiveStreamDialog must be used within a LiveStreamDialogProvider"
      )
   }
   return context
}

export default LivestreamDialog
