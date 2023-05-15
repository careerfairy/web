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
import dynamic from "next/dynamic"
import CircularProgress from "@mui/material/CircularProgress"
import { LoadableBaseOptions } from "next/dist/shared/lib/dynamic"
import { SlideLeftTransition, SlideUpTransition } from "../common/transitions"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { UserStats } from "@careerfairy/shared-lib/users"
import LivestreamDetailsViewSkeleton from "./views/livestream-details/LivestreamDetailsViewSkeleton"

const styles = sxStyles({
   content: {
      p: 0,
      display: "grid",
   },
   fullHeight: {
      height: "100%",
   },
   swipeableViews: {
      height: "100%",
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
   almostFullHeight: (theme) => ({
      height: "calc(100% - 64px)",
      borderTopLeftRadius: `${theme.spacing(2)} !important`,
      borderTopRightRadius: `${theme.spacing(2)} !important`,
   }),
   dialogPaper: {
      borderRadius: {
         md: 5,
      },
      maxWidth: 915,
   },
})

type Props = {
   serverSideLivestream: LivestreamEvent
   livestreamId: string
   handleClose: () => void
   open: boolean
   page: "details" | "register" | "job-details"
   updatedStats: UserStats
   serverUserEmail: string
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
      loadingComponent: () => <LivestreamDetailsViewSkeleton />,
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

const LivestreamDialog: FC<Props> = ({
   handleClose,
   open,
   livestreamId,
   ...rest
}) => {
   const isMobile = useIsMobile()
   const onClose = useCallback(() => {
      handleClose()
   }, [handleClose])

   return (
      <Dialog
         open={open}
         onClose={onClose}
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
            {livestreamId ? (
               <Content
                  handleClose={onClose}
                  livestreamId={livestreamId}
                  {...rest}
               />
            ) : (
               <LivestreamDetailsViewSkeleton />
            )}
         </DialogContent>
      </Dialog>
   )
}

type ContentProps = Omit<Props, "open">

const Content: FC<ContentProps> = ({
   handleClose,
   serverSideLivestream,
   updatedStats,
   serverUserEmail,
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

   const handleBack = useCallback(() => {
      if (views[value].key === "livestream-details") {
         onClose()
      } else {
         goToView("livestream-details")
      }
   }, [value, onClose, goToView])

   const contextValue = useMemo<DialogContextType>(
      () => ({
         goToView,
         closeDialog: onClose,
         livestream,
         activeView: views[value].key,
         handleBack,
         livestreamPresenter: livestream
            ? LivestreamPresenter.createFromDocument(livestream)
            : null,
         updatedStats,
         serverUserEmail,
      }),
      [
         goToView,
         onClose,
         livestream,
         value,
         handleBack,
         updatedStats,
         serverUserEmail,
      ]
   )

   return (
      <DialogContext.Provider value={contextValue}>
         <SwipeableViews
            style={styles.swipeableViews}
            containerStyle={styles.swipeableViewsContainer}
            slideStyle={styles.slide}
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
      </DialogContext.Provider>
   )
}

type DialogContextType = {
   goToView: (view: ViewKey) => void
   handleBack: () => void
   closeDialog: () => void
   /*
    * Undefined -> loading
    * Null -> no livestream
    * */
   livestream: LivestreamEvent | undefined | null
   livestreamPresenter: LivestreamPresenter
   activeView: ViewKey
   /*
    * The user's stats, no stats we fallback to the server side stats
    * */
   updatedStats: UserStats
   serverUserEmail: string
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
   handleBack: () => {},
   goToView: () => {},
   livestream: undefined,
   livestreamPresenter: null,
   activeView: "livestream-details",
   updatedStats: null,
   serverUserEmail: null,
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
