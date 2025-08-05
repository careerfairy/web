import { createContext, useContext } from "react"
import FeedbackDialog from "./FeedbackDialog"

type FeedbackDialogContextValue = {
   livestreamId: string
   feedbackQuestionId: string | null
   onRatingQuestionClick?: (ratingId: string) => void
   onBackToFeedback?: () => void
   onCloseFeedbackDialog: () => void
}

type FeedbackDialogProviderProps = FeedbackDialogContextValue

const FeedbackDialogContext = createContext<FeedbackDialogContextValue | null>(
   null
)

export const useFeedbackDialogContext = () => {
   const context = useContext(FeedbackDialogContext)
   if (!context) {
      throw new Error(
         "useFeedbackDialogContext must be used within a FeedbackDialogProvider"
      )
   }
   return context
}

export const FeedbackDialogProvider = (props: FeedbackDialogProviderProps) => {
   return (
      <FeedbackDialogContext.Provider value={props}>
         <FeedbackDialog />
      </FeedbackDialogContext.Provider>
   )
}
