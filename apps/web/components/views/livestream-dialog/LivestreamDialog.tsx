import {
   ComponentType,
   createContext,
   FC,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useLivestream from "../../custom-hook/live-stream/useLivestream"
import { Dialog, DialogContent } from "@mui/material"
import useIsMobile from "../../custom-hook/useIsMobile"
import { sxStyles } from "../../../types/commonTypes"
import SwipeableViews from "react-swipeable-views"
import { useTheme } from "@mui/material/styles"
import { AnimatedTabPanel } from "../../../materialUI/GlobalPanels/GlobalPanels"
import { SlideUpTransition } from "../common/transitions"
import dynamic from "next/dynamic"
import CircularProgress from "@mui/material/CircularProgress"
import { LoadableBaseOptions } from "next/dist/shared/lib/dynamic"

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
   livestreamId: string
   handleClose: () => void
   open: boolean
   page: "details" | "register" | "job-details"
}
type ViewKey =
   | "livestream-details"
   | "register-data-consent"
   | "register-ask-questions"
   | "register-join-talent-pool"
   | "register-success"
   | "job-details"

type ViewProps = {
   key: ViewKey
   viewPath: string
   loadingComponent?: LoadableBaseOptions["loading"]
}

type View = {
   key: ViewKey
   component: ComponentType
}

const createView = ({ key, viewPath, loadingComponent }: ViewProps): View => ({
   key,
   component: dynamic(() => import(`./views/${viewPath}`), {
      loading: loadingComponent || (() => <CircularProgress />),
   }),
})

const views: View[] = [
   createView({
      key: "livestream-details",
      viewPath: "livestream-details/LivestreamDetailsView",
   }),
   createView({
      key: "register-data-consent",
      viewPath: "data-consent/RegisterDataConsentView",
   }),
   createView({
      key: "register-ask-questions",
      viewPath: "ask-questions/RegisterAskQuestionsView",
   }),
   createView({
      key: "register-join-talent-pool",
      viewPath: "join-talent-pool/RegisterJoinTalentPoolView",
   }),
   createView({
      key: "register-success",
      viewPath: "register-success/RegisterSuccessView",
   }),
   createView({ key: "job-details", viewPath: "job-details/JobDetailsView" }),
]

const LivestreamDialog: FC<Props> = ({ handleClose, open, ...rest }) => {
   const isMobile = useIsMobile()

   const onClose = useCallback(() => {
      handleClose()
   }, [handleClose])

   return (
      <Dialog
         open={open}
         onClose={onClose}
         TransitionComponent={SlideUpTransition}
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
   livestreamId,
}) => {
   const theme = useTheme()

   const [value, setValue] = useState<number>(getInitialValue(page))

   const hasInitialData =
      serverSideLivestream && livestreamId === serverSideLivestream.id

   const { data: livestream } = useLivestream(
      livestreamId,
      hasInitialData ? serverSideLivestream : undefined
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
      }),
      [goToView, onClose, livestream, value]
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
}

const getInitialValue = (page: Props["page"]): number => {
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
