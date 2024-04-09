import { useLivestreamOngoingPoll } from "components/custom-hook/streaming/useLivestreamOngoingPoll"
import { useStreamingContext } from "../../context"
import { useEffect } from "react"
import { openChat } from "store/reducers/streamingAppReducer"
import { useAppDispatch } from "components/custom-hook/store"
import { SuspenseWithBoundary } from "components/ErrorBoundary"

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
   const hasOngoingPoll = Boolean(ongoingPoll)

   const dispatch = useAppDispatch()

   useEffect(() => {
      // When a poll is started, we want all viewers to be redirected to the polls view
      if (hasOngoingPoll) {
         dispatch(openChat())
      }
   }, [dispatch, hasOngoingPoll])

   return null
}
