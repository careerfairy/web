import { createContext, useContext } from "react"
import FeedbackDialog from "./FeedbackDialog"

type FeedbackDialogContextValue = {
   /** The ID of the livestream to display feedback for */
   livestreamId: string
   /** The ID of the specific feedback question being viewed, null for general overview */
   feedbackQuestionId: string | null
   /** Should set feedbackQuestionId to the provided ratingId to show detailed question view */
   onRatingQuestionClick: (ratingId: string) => void
   /** Should set feedbackQuestionId to null to return to general feedback overview */
   onBackToFeedback: () => void
   /** Should close the feedback dialog and handle any cleanup */
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
