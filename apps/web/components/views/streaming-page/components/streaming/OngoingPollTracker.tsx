import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useAppDispatch } from "components/custom-hook/store"
import { useLivestreamOngoingPoll } from "components/custom-hook/streaming/useLivestreamOngoingPoll"
import { useEffect } from "react"
import {
   ActiveViews,
   openPolls,
   setActiveView,
} from "store/reducers/streamingAppReducer"
import { useIsRecordingWindow } from "store/selectors/streamingAppSelectors"
import { useStreamingContext } from "../../context"

/**
 * Component for tracking and responding to ongoing polls in a livestream.
 *
 * It checks for active polls using `useLivestreamHasOngoingPoll` and updates the app's view
 * for non-host users to focus on the poll. This component does not render any UI elements.
 */
export const OngoingPollTracker = () => {
   return (
      <SuspenseWithBoundary fallback={<></>}>
         <Content />
      </SuspenseWithBoundary>
   )
}

export const Content = () => {
   const { livestreamId } = useStreamingContext()
   const ongoingPoll = useLivestreamOngoingPoll(livestreamId)
   const isRecordingWindow = useIsRecordingWindow()
   const ongoingPollId = ongoingPoll?.id

   const dispatch = useAppDispatch()

   useEffect(() => {
      // When a poll is started, we want all viewers to be redirected to the polls view
      if (ongoingPollId) {
         dispatch(openPolls())
      } else {
         // When a poll is not active, we want the recording window to go back to the Q&A view
         if (isRecordingWindow) {
            dispatch(setActiveView(ActiveViews.QUESTIONS))
         }
      }
   }, [dispatch, ongoingPollId, isRecordingWindow])

   return null
}
