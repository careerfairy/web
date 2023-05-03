import React, {
   createContext,
   Dispatch,
   FC,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { useRouter } from "next/router"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import FeedbackDialog from "./feedback-dialog/FeedbackDialog"

export const SORT_DIRECTIONS = {
   Latest: "desc",
   Oldest: "asc",
} as const

type IFeedbackPageContext = {
   handleOpenFeedbackDialog: (livestreamId: string) => void
   handleCloseFeedbackDialog: () => void
   sortDirection: keyof typeof SORT_DIRECTIONS
   setSortDirection: Dispatch<IFeedbackPageContext["sortDirection"]>
}

const initialValues: IFeedbackPageContext = {
   handleOpenFeedbackDialog: () => {},
   handleCloseFeedbackDialog: () => {},
   sortDirection: "Latest",
   setSortDirection: () => {},
}

const FeedbackPageContext = createContext<IFeedbackPageContext>(initialValues)

export const FeedbackPageProvider: FC = ({ children }) => {
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
            `/group/${group.id}/admin/analytics/feedback/${livestreamId}`
         )
      },
      [group.id, push]
   )

   const handleCloseFeedbackDialog = useCallback(() => {
      void push(`/group/${group.id}/admin/analytics/feedback`)
   }, [group.id, push])

   const value = useMemo<IFeedbackPageContext>(
      () => ({
         handleOpenFeedbackDialog,
         handleCloseFeedbackDialog,
         sortDirection,
         setSortDirection,
      }),
      [handleCloseFeedbackDialog, handleOpenFeedbackDialog, sortDirection]
   )

   return (
      <FeedbackPageContext.Provider value={value}>
         {children}
         {livestreamId ? (
            <FeedbackDialog
               livestreamId={livestreamId}
               feedbackQuestionId={feedbackQuestionId}
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
