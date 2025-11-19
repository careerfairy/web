import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { SlideUpTransition } from "components/views/common/transitions"
import {
   createContext,
   Fragment,
   ReactNode,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { sxStyles } from "../../../../../../../types/commonTypes"
import DateUtil from "../../../../../../../util/DateUtil"
import { ResponsiveDialogLayout } from "../../../../../common/ResponsiveDialog"
import { EventRatingWithType } from "../../../events/detail/form/views/questions/commons"
import { useFeedbackQuestions } from "../../../events/detail/form/views/questions/useFeedbackQuestions"
import { FeedbackDetail } from "./FeedbackDetail"

const styles = sxStyles({
   paper: {
      maxWidth: 996,
      borderRadius: 3,
      p: 3,
      maxHeight: "90vh",
   },
   dialogContent: {
      p: 0,
      mt: 3,
   },
   header: {
      p: 0,
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
   const { feedbackQuestions: allFeedbackQuestions } = useFeedbackQuestions(
      liveStreamStats.livestream.id,
      "livestreams"
   )

   const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
      Object.keys(liveStreamStats.ratings)?.[0] ?? null
   )

   const onFeedbackQuestionClick = useCallback(
      (question: EventRatingWithType) => {
         setSelectedQuestionId(question.id)
      },
      []
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
   stats: LiveStreamStats
   onClose: () => void
   open: boolean
}

export const FeedbackDialog = ({
   stats,
   onClose,
   open,
}: FeedbackDialogProps) => {
   return (
      <ResponsiveDialogLayout
         open={open}
         handleClose={onClose}
         dialogPaperStyles={styles.paper}
         TransitionComponent={SlideUpTransition}
         TransitionProps={{ unmountOnExit: true }}
         SlideProps={{ unmountOnExit: true }}
         dataTestId="feedback-dialog"
      >
         <SuspenseWithBoundary fallback={<></>}>
            {Boolean(stats) && <Content stats={stats} onClose={onClose} />}
         </SuspenseWithBoundary>
      </ResponsiveDialogLayout>
   )
}

type ContentProps = {
   stats: LiveStreamStats
   onClose: () => void
}

const Content = ({ stats, onClose }: ContentProps) => {
   return (
      <Fragment>
         <ResponsiveDialogLayout.Header
            handleClose={onClose}
            sx={styles.header}
         >
            <Stack spacing={0.5}>
               <Typography variant="small" color="neutral.400">
                  {stats?.livestream?.start
                     ? DateUtil.formatFullDateWithTime(
                          stats.livestream.start.toDate()
                       )
                     : ""}
               </Typography>
               <Typography variant="brandedH3" color="text.primary">
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
