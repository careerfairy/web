import React, {
   createContext,
   FC,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"

type IFeedbackPageContext = {
   feedbackDialogProps: FeedbackDialogProps
   handleOpenFeedbackDialog: (
      livestreamId: string,
      initialStatsData?: LiveStreamStats
   ) => void
   handleCloseFeedbackDialog: () => void
}

const initialValues: IFeedbackPageContext = {
   feedbackDialogProps: null,
   handleOpenFeedbackDialog: () => {},
   handleCloseFeedbackDialog: () => {},
}

const FeedbackPageContext = createContext<IFeedbackPageContext>(initialValues)

type FeedbackDialogProps = {
   livestreamId: string
   initialStatsData?: LiveStreamStats
} | null

export const FeedbackPageProvider: FC = ({ children }) => {
   const [feedbackDialogProps, setFeedbackDialogProps] =
      useState<FeedbackDialogProps>(null)

   const handleOpenFeedbackDialog = (
      id: string,
      initialStatsData?: LiveStreamStats
   ) => {
      setFeedbackDialogProps({ livestreamId: id, initialStatsData })
   }

   const handleCloseFeedbackDialog = useCallback(() => {
      setFeedbackDialogProps(null)
   }, [])

   const value = useMemo(
      () => ({
         feedbackDialogProps,
         handleOpenFeedbackDialog,
         handleCloseFeedbackDialog,
      }),
      [feedbackDialogProps, handleCloseFeedbackDialog]
   )

   return (
      <FeedbackPageContext.Provider value={value}>
         {children}
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
