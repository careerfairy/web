import {
   ComponentType,
   createContext,
   Dispatch,
   FC,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useReducer,
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
import JobDetailsViewSkeleton from "./views/job-details/JobDetailsViewSkeleton"
import RegisterAskQuestionsViewSkeleton from "./views/ask-questions/RegisterAskQuestionsViewSkeleton"
import RegisterSuccessViewSkeleton from "./views/register-success/RegisterSuccessViewSkeleton"
import { useRouter } from "next/router"
import { buildDialogLink } from "./util"
import {
   RegistrationAction,
   registrationInitialState,
   registrationReducer,
   RegistrationState,
} from "./registrationReducer"
import { isFromNewsletter } from "../../../util/PathUtils"
import RegisterDataConsentViewSkeleton from "./views/data-consent/RegisterDataConsentViewSkeleton"
import RegisterJoinTalentPoolViewSkeleton from "./views/join-talent-pool/RegisterJoinTalentPoolViewSkeleton"
import useRedirectToEventRoom from "../../custom-hook/live-stream/useRedirectToEventRoom"
import { NICE_SCROLLBAR_STYLES } from "../../../constants/layout"
import RedirectingView from "./views/common/RedirectingView"

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
      ...NICE_SCROLLBAR_STYLES,
      borderRadius: {
         md: 5,
      },
      maxWidth: 915,
      height: "100%",
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
   /**
    * The mode of operation for the dialog. Can be either "page" or "stand-alone".
    * In "page" mode, the entire page will navigate between views.
    * In "stand-alone" mode, only the view state of the dialog is updated, and the page remains static.
    */
   mode: DialogContextType["mode"]
   onRegisterSuccess?: () => void
}

export type ViewKey =
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
   skeleton: LoadableBaseOptions["loading"]
}

const createView = ({ key, viewPath, loadingComponent }: ViewProps): View => ({
   key,
   component: dynamic(() => import(`./views/${viewPath}`), {
      loading: loadingComponent || (() => <CircularProgress />),
   }),
   skeleton: loadingComponent || (() => <CircularProgress />), // new
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
      loadingComponent: () => <RegisterDataConsentViewSkeleton />,
   }),
   createView({
      key: "register-ask-questions",
      viewPath: "ask-questions/RegisterAskQuestionsView",
      loadingComponent: () => <RegisterAskQuestionsViewSkeleton />,
   }),
   createView({
      key: "register-join-talent-pool",
      viewPath: "join-talent-pool/RegisterJoinTalentPoolView",
      loadingComponent: () => <RegisterJoinTalentPoolViewSkeleton />,
   }),
   createView({
      key: "register-success",
      viewPath: "register-success/RegisterSuccessView",
      loadingComponent: () => <RegisterSuccessViewSkeleton />,
   }),
   createView({
      key: "job-details",
      viewPath: "job-details/JobDetailsView",
      loadingComponent: () => <JobDetailsViewSkeleton />,
   }),
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
   onRegisterSuccess,
   page = "details",
   livestreamId,
   mode = "page",
}) => {
   const router = useRouter()
   const { push, query } = router

   /**
    * Mark this event registration as recommended if the user came from the
    * careerfairy newsletter
    */
   const isRecommended = isFromNewsletter(query)

   const theme = useTheme()

   const [value, setValue] = useState<number>(getPageIndex(page))
   const [jobId, setJobId] = useState<string | null>(null)

   const hasInitialData =
      serverSideLivestream && livestreamId === serverSideLivestream.id

   const { data: livestream } = useLivestream(
      livestreamId,
      hasInitialData ? serverSideLivestream : undefined
   )

   const goToView = useCallback(
      (view: Exclude<ViewKey, "job-details">) => {
         switch (view) {
            case "livestream-details":
               if (mode === "page") {
                  return void push(
                     buildDialogLink({
                        router,
                        link: {
                           type: "livestreamDetails",
                           livestreamId,
                        },
                     }),
                     undefined,
                     routerOptions
                  )
               }
            case "register-data-consent":
               if (mode === "page") {
                  return void push(
                     buildDialogLink({
                        router,
                        link: {
                           type: "registerToLivestream",
                           livestreamId,
                        },
                     }),
                     undefined,
                     routerOptions
                  )
               }

            case "register-ask-questions":
               if (livestream?.questionsDisabled) {
                  view = "register-join-talent-pool"
               }

            default:
               setValue(views.findIndex((v) => v.key === view))
         }
      },
      [livestreamId, push, router, livestream?.questionsDisabled, mode]
   )

   const goToJobDetails = useCallback(
      (jobId: string) => {
         if (mode === "page") {
            push(
               buildDialogLink({
                  router,
                  link: {
                     jobId,
                     livestreamId,
                     type: "jobDetails",
                  },
               }),
               undefined,
               routerOptions
            )
         } else {
            setJobId(jobId)
            setValue(views.findIndex((v) => v.key === "job-details"))
         }
      },
      [push, router]
   )

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

   // Using useEffect to update the view based on 'page'.
   // This allows conditional navigation not covered by useMemo.
   useEffect(() => {
      setValue(getPageIndex(page))
   }, [page])

   const [registrationState, registrationDispatch] = useReducer(
      registrationReducer,
      registrationInitialState
   )

   const livestreamPresenter = useMemo(
      () =>
         livestream ? LivestreamPresenter.createFromDocument(livestream) : null,
      [livestream]
   )

   const isRedirecting = useRedirectToEventRoom(
      livestreamPresenter,
      mode === "page"
   )

   const contextValue = useMemo<DialogContextType>(
      () => ({
         goToView,
         closeDialog: onClose,
         livestream,
         activeView: views[value].key,
         handleBack,
         livestreamPresenter,
         updatedStats,
         serverUserEmail,
         isRecommended,
         registrationState,
         registrationDispatch,
         jobId,
         goToJobDetails,
         mode,
         onRegisterSuccess,
      }),
      [
         goToView,
         onClose,
         livestream,
         value,
         handleBack,
         updatedStats,
         serverUserEmail,
         isRecommended,
         registrationState,
         registrationDispatch,
      ]
   )

   return (
      <DialogContext.Provider value={contextValue}>
         {isRedirecting ? (
            <RedirectingView />
         ) : (
            <SwipeableViews
               style={styles.swipeableViews}
               containerStyle={styles.swipeableViewsContainer}
               slideStyle={styles.slide}
               disabled
               axis={theme.direction === "rtl" ? "x-reverse" : "x"}
               index={value}
            >
               {views.map(
                  ({ key, component: View, skeleton: Skeleton }, index) => (
                     <AnimatedTabPanel
                        sx={styles.fullHeight}
                        key={key}
                        value={index}
                        activeValue={value}
                     >
                        {livestream ? <View /> : Skeleton}
                     </AnimatedTabPanel>
                  )
               )}
            </SwipeableViews>
         )}
      </DialogContext.Provider>
   )
}

type DialogContextType = {
   goToView: (view: ViewKey) => void
   handleBack: () => void
   closeDialog: () => void
   /**
    *The ID of a job associated with the livestream.
    */
   jobId: string | null

   /**
    * Method to navigate to the job details view.
    */
   goToJobDetails: (jobId: string) => void
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

   // registration flow data
   isRecommended: boolean
   registrationState: RegistrationState
   registrationDispatch: Dispatch<RegistrationAction>
   /**
    * The mode of operation for the dialog. Can be either "page" or "stand-alone".
    * In "page" mode, the entire page will navigate between certain views.
    * In "stand-alone" mode, only the view state of the dialog is updated, and the page remains static.
    */
   mode: "page" | "stand-alone"
   /**
    * Callback to be called when the user successfully registers for the livestream.
    * This replaces the default behavior of going to the next view in the dialog.
    */
   onRegisterSuccess?: () => void
}

const getPageIndex = (page: Props["page"]): number => {
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
   jobId: null,
   goToJobDetails: () => {},
   livestream: undefined,
   livestreamPresenter: null,
   activeView: "livestream-details",
   updatedStats: null,
   serverUserEmail: null,
   isRecommended: false,
   registrationState: registrationInitialState,
   registrationDispatch: () => {},
   mode: "page",
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

const routerOptions = {
   shallow: true,
   scroll: false,
} as const

export default LivestreamDialog
