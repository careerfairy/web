import { useRouter } from "next/router"
import {
   createContext,
   Dispatch,
   ReactNode,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import { FeedbackDialogProvider } from "./feedback-dialog/FeedbackDialogProvider"

export const SORT_DIRECTIONS = {
   Latest: "desc",
   Oldest: "asc",
} as const

type IFeedbackPageContext = {
   livestreamId: string
   handleOpenFeedbackDialog: (livestreamId: string) => void
   handleCloseFeedbackDialog: () => void
   sortDirection: keyof typeof SORT_DIRECTIONS
   setSortDirection: Dispatch<IFeedbackPageContext["sortDirection"]>
}

const initialValues: IFeedbackPageContext = {
   livestreamId: "",
   handleOpenFeedbackDialog: () => {},
   handleCloseFeedbackDialog: () => {},
   sortDirection: "Latest",
   setSortDirection: () => {},
}

const FeedbackPageContext = createContext<IFeedbackPageContext>(initialValues)

type FeedbackPageProviderProps = {
   children: ReactNode
}

export const FeedbackPageProvider = ({
   children,
}: FeedbackPageProviderProps) => {
   const { group } = useGroup()

   const {
      push,
      query: { feedback },
   } = useRouter()

   const livestreamId = feedback?.[0]
   const feedbackQuestionId = feedback?.[2]

   const [sortDirection, setSortDirection] = useState(
      initialValues.sortDirection
   )

   const handleOpenFeedbackDialog = useCallback(
      (livestreamId: string) => {
         void push(
            `/group/${group.id}/admin/analytics/live-streams/feedback/${livestreamId}`
         )
      },
      [group.id, push]
   )

   const handleCloseFeedbackDialog = useCallback(() => {
      void push(`/group/${group.id}/admin/analytics/live-streams/feedback`)
   }, [group.id, push])

   const handleRatingQuestionClick = useCallback(
      (ratingId: string) => {
         void push(
            `/group/${group.id}/admin/analytics/live-streams/feedback/${livestreamId}/question/${ratingId}`
         )
      },
      [group.id, push, livestreamId]
   )

   const handleBackToFeedback = useCallback(() => {
      void push(
         `/group/${group.id}/admin/analytics/live-streams/feedback/${livestreamId}`
      )
   }, [group.id, push, livestreamId])

   const value = useMemo<IFeedbackPageContext>(
      () => ({
         handleOpenFeedbackDialog,
         handleCloseFeedbackDialog,
         sortDirection,
         setSortDirection,
         livestreamId,
      }),
      [
         handleCloseFeedbackDialog,
         handleOpenFeedbackDialog,
         livestreamId,
         sortDirection,
      ]
   )

   return (
      <FeedbackPageContext.Provider value={value}>
         {children}
         {livestreamId ? (
            <FeedbackDialogProvider
               livestreamId={livestreamId}
               feedbackQuestionId={feedbackQuestionId}
               onRatingQuestionClick={handleRatingQuestionClick}
               onBackToFeedback={handleBackToFeedback}
               onCloseFeedbackDialog={handleCloseFeedbackDialog}
            />
         ) : null}
      </FeedbackPageContext.Provider>
   )
}

export const useFeedbackPageContext = () => {
   const context = useContext(FeedbackPageContext)
   if (context === undefined) {
      throw new Error(
         "useFeedbackPageContext must be used within a FeedbackPageContextProvider"
      )
   }
   return context
}
