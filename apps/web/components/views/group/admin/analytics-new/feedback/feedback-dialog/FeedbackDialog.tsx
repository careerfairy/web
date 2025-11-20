import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { getQueryStringArray } from "@careerfairy/shared-lib/utils"
import { Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { SlideUpTransition } from "components/views/common/transitions"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/router"
import {
   createContext,
   Fragment,
   ReactNode,
   useCallback,
   useContext,
   useMemo,
} from "react"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { sxStyles } from "../../../../../../../types/commonTypes"
import DateUtil from "../../../../../../../util/DateUtil"
import { ResponsiveDialogLayout } from "../../../../../common/ResponsiveDialog"
import { EventRatingWithType } from "../../../events/detail/form/views/questions/commons"
import { useFeedbackQuestions } from "../../../events/detail/form/views/questions/useFeedbackQuestions"
import { FeedbackDetail } from "./FeedbackDetail"

const styles = sxStyles({
   paper: {
      maxWidth: 1100,
      borderRadius: 3,
      p: {
         xs: 1.5,
         md: 4,
      },
      maxHeight: "90vh",
   },
   dialogContent: (theme) => ({
      p: "0px !important",
      mt: {
         xs: `${theme.spacing(3)} !important`,
         md: `${theme.spacing(4)} !important`,
      },
   }),
   header: {
      p: "0px !important",
      position: "relative",
      "& .close-button": {
         position: "absolute",
         top: {
            xs: 0,
            md: -16,
         },
         right: {
            xs: 0,
            md: -16,
         },
      },
   },
})

type FeedbackDialogContextValue = {
   liveStreamStats: LiveStreamStats
   onClose: () => void
   selectedFeedbackQuestion: EventRatingWithType
   allFeedbackQuestions: EventRatingWithType[]
   onFeedbackQuestionClick: (question: EventRatingWithType) => void
}

const FeedbackDialogContext = createContext<
   FeedbackDialogContextValue | undefined
>(undefined)

export const useFeedbackDialogContext = (): FeedbackDialogContextValue => {
   const context = useContext(FeedbackDialogContext)
   if (!context) {
      throw new Error(
         "useFeedbackDialogContext must be used within a FeedbackDialogContext.Provider"
      )
   }
   return context
}

type FeedbackDialogProviderProps = {
   liveStreamStats: LiveStreamStats
   onClose: () => void
   children: ReactNode
}

const FeedbackDialogProvider = ({
   liveStreamStats,
   onClose,
   children,
}: FeedbackDialogProviderProps) => {
   const router = useRouter()
   const { feedbackQuestions: allFeedbackQuestions } = useFeedbackQuestions(
      liveStreamStats.livestream.id,
      "livestreams"
   )

   const currentId = getQueryStringArray(router.query.feedbackId)[0]

   const selectedQuestionId = currentId || allFeedbackQuestions?.[0]?.id || null

   const onFeedbackQuestionClick = useCallback(
      (question: EventRatingWithType) => {
         router.push(
            {
               pathname: router.pathname,
               query: { ...router.query, feedbackId: question.id },
            },
            undefined,
            { shallow: true }
         )
      },
      [router]
   )

   const selectedFeedbackQuestion = useMemo(
      () =>
         allFeedbackQuestions.find(
            (question) => question.id === selectedQuestionId
         ) ?? null,
      [allFeedbackQuestions, selectedQuestionId]
   )

   const contextValue = useMemo<FeedbackDialogContextValue>(
      () => ({
         liveStreamStats,
         onClose,
         selectedFeedbackQuestion,
         allFeedbackQuestions,
         onFeedbackQuestionClick,
      }),
      [
         liveStreamStats,
         onClose,
         selectedFeedbackQuestion,
         allFeedbackQuestions,
         onFeedbackQuestionClick,
      ]
   )

   if (!selectedFeedbackQuestion) {
      return null
   }

   return (
      <FeedbackDialogContext.Provider value={contextValue}>
         {children}
      </FeedbackDialogContext.Provider>
   )
}

type FeedbackDialogProps = {
   onClose: () => void
}

const useLivestreamStats = (livestreamId: string | undefined) => {
   const firestore = useFirestore()

   const { data: stats } = useSWR(
      livestreamId ? `livestream-stats-${livestreamId}` : null,
      async () => {
         if (!livestreamId) return null

         const statsRef = doc(
            firestore,
            "livestreams",
            livestreamId,
            "stats",
            "livestreamStats"
         ).withConverter(createGenericConverter<LiveStreamStats>())

         const statsSnap = await getDoc(statsRef)

         if (!statsSnap.exists()) return null

         return statsSnap.data()
      }
   )

   return { stats }
}

export const FeedbackDialog = ({ onClose }: FeedbackDialogProps) => {
   const router = useRouter()
   const feedbackLivestreamId = router.query.feedbackLivestreamId as string
   const { stats } = useLivestreamStats(feedbackLivestreamId)

   return (
      <ResponsiveDialogLayout
         open={Boolean(feedbackLivestreamId)}
         handleClose={onClose}
         dialogPaperStyles={styles.paper}
         TransitionComponent={SlideUpTransition}
         TransitionProps={{ unmountOnExit: true }}
         SlideProps={{ unmountOnExit: true }}
         dataTestId="feedback-dialog"
         hideDragHandle
      >
         <SuspenseWithBoundary fallback={<></>}>
            {Boolean(stats) && <Content stats={stats!} onClose={onClose} />}
         </SuspenseWithBoundary>
      </ResponsiveDialogLayout>
   )
}

type ContentProps = {
   stats: LiveStreamStats
   onClose: () => void
}

const Content = ({ stats, onClose }: ContentProps) => {
   const isMobile = useIsMobile()
   return (
      <Fragment>
         <ResponsiveDialogLayout.Header
            handleClose={onClose}
            sx={styles.header}
         >
            <Stack spacing={0.5}>
               <Typography variant="small" color="neutral.400">
                  {Boolean(stats?.livestream?.start) &&
                     DateUtil.formatFullDateWithTime(
                        stats.livestream.start.toDate()
                     )}
               </Typography>
               <Typography
                  variant={isMobile ? "mobileBrandedH4" : "desktopBrandedH5"}
                  color="neutral.800"
                  fontWeight={isMobile ? 600 : 700}
               >
                  {stats?.livestream?.title}
               </Typography>
            </Stack>
         </ResponsiveDialogLayout.Header>

         <ResponsiveDialogLayout.Content sx={styles.dialogContent}>
            <FeedbackDialogProvider liveStreamStats={stats} onClose={onClose}>
               <FeedbackDetail />
            </FeedbackDialogProvider>
         </ResponsiveDialogLayout.Content>
      </Fragment>
   )
}

export default FeedbackDialog
