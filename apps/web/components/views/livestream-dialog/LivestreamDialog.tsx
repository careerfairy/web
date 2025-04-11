import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { UserStats } from "@careerfairy/shared-lib/users"
import { Dialog, DialogContent } from "@mui/material"
import CircularProgress from "@mui/material/CircularProgress"
import { useTheme } from "@mui/material/styles"
import { LoadableOptions } from "next/dist/shared/lib/dynamic"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import {
   ComponentType,
   Dispatch,
   FC,
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useReducer,
   useState,
} from "react"
import SwipeableViews from "react-swipeable-views"
import { NICE_SCROLLBAR_STYLES } from "../../../constants/layout"
import { AnimatedTabPanel } from "../../../materialUI/GlobalPanels/GlobalPanels"
import { sxStyles } from "../../../types/commonTypes"
import { isFromNewsletter } from "../../../util/PathUtils"
import useLivestream from "../../custom-hook/live-stream/useLivestream"
import useRedirectToEventRoom from "../../custom-hook/live-stream/useRedirectToEventRoom"
import useIsMobile from "../../custom-hook/useIsMobile"
import { SlideLeftTransition, SlideUpTransition } from "../common/transitions"
import {
   RegistrationAction,
   RegistrationState,
   registrationInitialState,
   registrationReducer,
} from "./registrationReducer"
import { buildDialogLink } from "./util"
import RegisterAskQuestionsViewSkeleton from "./views/ask-questions/RegisterAskQuestionsViewSkeleton"
import RedirectingView from "./views/common/RedirectingView"
import RegisterDataConsentViewSkeleton from "./views/data-consent/RegisterDataConsentViewSkeleton"
import JobDetailsViewSkeleton from "./views/job-details/JobDetailsViewSkeleton"
import LivestreamDetailsViewSkeleton from "./views/livestream-details/LivestreamDetailsViewSkeleton"
import RegisterSuccessViewSkeleton from "./views/register-success/RegisterSuccessViewSkeleton"
import { AskPhoneNumberViewSkeleton } from "./views/sms/AskPhoneNumberViewSkeleton"
import SpeakerDetailsViewSkeleton from "./views/speaker-details/SpeakerDetailsViewSkeleton"

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

export const AllDialogSettings = {
   Levels: "Levels",
   SparksFeed: "SparksFeed",
} as const

export type DialogSetting = keyof typeof AllDialogSettings

type Props = {
   serverSideLivestream?: LivestreamEvent
   livestreamId: string
   handleClose: () => void
   open: boolean
   page: "details" | "register" | "job-details" | "speaker-details"
   updatedStats?: UserStats
   serverUserEmail: string
   /**
    * The mode of operation for the dialog. Can be either "page" or "stand-alone".
    * In "page" mode, the entire page will navigate between views.
    * In "stand-alone" mode, only the view state of the dialog is updated, and the page remains static.
    *
    * Defaults to "page".
    */
   mode?: DialogContextType["mode"]
   onRegisterSuccess?: () => void
   currentSparkId?: string
   /**
    * The ID of a job associated with the live stream.
    *
    * Note: This property is only available in the "stand-alone" mode.
    */
   jobId?: string
   /**
    * The ID of a speaker associated with the live stream.
    *
    * Note: This property is only available in the "stand-alone" mode.
    */
   speakerId?: string
   isDiscoverCompanySparksOpen?: boolean
   handleDiscoverCompanySparks?: () => void
   setting?: DialogSetting
   appear?: boolean
}

type ViewProps<T extends string> = {
   key: T
   viewPath: string
   loadingComponent?: LoadableOptions["loading"]
}

type View<T extends string = string> = {
   key: T
   component: ComponentType
   skeleton: LoadableOptions["loading"]
}

const createView = <T extends string = string>({
   key,
   viewPath,
   loadingComponent,
}: ViewProps<T>): View<T> => ({
   key,
   component: dynamic(() => import(`./views/${viewPath}`), {
      loading: loadingComponent || (() => <CircularProgress />),
   }),
   skeleton: loadingComponent || (() => <CircularProgress />), // new
})

const views = [
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
      key: "register-success",
      viewPath: "register-success/RegisterSuccessView",
      loadingComponent: () => <RegisterSuccessViewSkeleton />,
   }),
   createView({
      key: "ask-phone-number",
      viewPath: "sms/AskPhoneNumberView",
      loadingComponent: () => <AskPhoneNumberViewSkeleton />,
   }),
   createView({
      key: "job-details",
      viewPath: "job-details/JobDetailsView",
      loadingComponent: () => <JobDetailsViewSkeleton />,
   }),
   createView({
      key: "speaker-details",
      viewPath: "speaker-details/SpeakerDetailsView",
      loadingComponent: () => <SpeakerDetailsViewSkeleton />,
   }),
] as const satisfies View[]

export type ViewKey = (typeof views)[number]["key"]

const LivestreamDialog: FC<Props> = ({
   handleClose,
   open,
   livestreamId,
   appear,
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
         TransitionProps={{
            appear: appear ?? undefined,
         }}
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
   currentSparkId,
   jobId,
   speakerId,
   setting,
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
   const [currentJobId, setCurrentJobId] = useState<string | null>(jobId)
   const [currentSpeakerId, setCurrentSpeakerId] = useState<string | null>(
      speakerId
   )

   const [isDiscoverCompanySparksOpen, setIsDiscoverCompanySparksOpen] =
      useState(false)

   const handleDiscoverCompanySparks = useCallback(() => {
      setIsDiscoverCompanySparksOpen(true)
   }, [])

   const hasInitialData =
      serverSideLivestream && livestreamId === serverSideLivestream.id

   const { data: livestream } = useLivestream(
      livestreamId,
      hasInitialData ? serverSideLivestream : undefined
   )

   const isPageMode = mode === "page"

   const goToView = useCallback(
      (view: Exclude<ViewKey, "job-details">) => {
         switch (view) {
            case "livestream-details":
               if (isPageMode) {
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
               break

            case "register-data-consent":
               if (isPageMode) {
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
               break

            case "register-ask-questions":
               if (livestream?.questionsDisabled) {
                  view = "register-success"
               }
               break
         }

         setValue(views.findIndex((v) => v.key === view))
      },
      [livestreamId, push, router, livestream?.questionsDisabled, isPageMode]
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
            setCurrentJobId(jobId)
            setValue(views.findIndex((v) => v.key === "job-details"))
         }
      },
      [livestreamId, mode, push, router]
   )

   const goToSpeakerDetails = useCallback(
      (speakerId: string) => {
         if (mode === "page") {
            push(
               buildDialogLink({
                  router,
                  link: {
                     speakerId: speakerId,
                     livestreamId,
                     type: "speakerDetails",
                  },
               }),
               undefined,
               routerOptions
            )
         } else {
            setCurrentSpeakerId(speakerId)
            setValue(views.findIndex((v) => v.key === "speaker-details"))
         }
      },
      [livestreamId, mode, push, router]
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
         jobId: currentJobId,
         goToJobDetails,
         goToSpeakerDetails: goToSpeakerDetails,
         speakerId: currentSpeakerId,
         mode,
         onRegisterSuccess,
         currentSparkId,
         isDiscoverCompanySparksOpen,
         handleDiscoverCompanySparks,
         setting,
      }),
      [
         goToView,
         onClose,
         livestream,
         value,
         handleBack,
         livestreamPresenter,
         updatedStats,
         serverUserEmail,
         isRecommended,
         registrationState,
         currentJobId,
         goToJobDetails,
         goToSpeakerDetails,
         currentSpeakerId,
         mode,
         onRegisterSuccess,
         currentSparkId,
         isDiscoverCompanySparksOpen,
         handleDiscoverCompanySparks,
         setting,
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
                        {livestream ? <View /> : <Skeleton />}
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
    * The ID of a job associated with the live stream.
    *
    * Note: This property is only available in the "stand-alone" mode.
    */
   jobId: string | null

   /**
    * Method to navigate to the job details view.
    *
    * Note: This method is only works in the "stand-alone" mode.
    */
   goToJobDetails: (jobId: string) => void
   /**
    * Method to navigate to the speaker details view.
    */
   goToSpeakerDetails: (speakerId: string) => void

   /**
    * The ID of a speaker associated with the live stream.
    *
    * Note: This property is only available in the "stand-alone" mode.
    */
   speakerId: string | null
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
    *
    * Defaults to "page".
    */
   mode: "page" | "stand-alone"
   /**
    * Callback to be called when the user successfully registers for the livestream.
    * This replaces the default behavior of going to the next view in the dialog.
    */
   onRegisterSuccess?: () => void
   currentSparkId?: string
   isDiscoverCompanySparksOpen: boolean
   handleDiscoverCompanySparks: () => void
   /**
    * Setting in which the dialog is shown. Used for conditional rendering, like showing
    * different text based on the dialog being shown on the levels page or the sparks feed.
    * */
   setting?: DialogSetting
}

const getPageIndex = (page: Props["page"]): number => {
   switch (page) {
      case "details":
         return views.findIndex((view) => view.key === "livestream-details")
      case "register":
         return views.findIndex((view) => view.key === "register-data-consent")
      case "job-details":
         return views.findIndex((view) => view.key === "job-details")
      case "speaker-details":
         return views.findIndex((view) => view.key === "speaker-details")
   }
}

const DialogContext = createContext<DialogContextType>({
   closeDialog: () => {},
   handleBack: () => {},
   goToView: () => {},
   jobId: null,
   goToJobDetails: () => {},
   goToSpeakerDetails: () => {},
   speakerId: null,
   livestream: undefined,
   livestreamPresenter: null,
   activeView: "livestream-details",
   updatedStats: null,
   serverUserEmail: null,
   isRecommended: false,
   registrationState: registrationInitialState,
   registrationDispatch: () => {},
   mode: "page",
   currentSparkId: null,
   isDiscoverCompanySparksOpen: false,
   handleDiscoverCompanySparks: () => {},
   setting: null,
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
