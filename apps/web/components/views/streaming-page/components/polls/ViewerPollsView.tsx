import { Slide, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamOngoingPoll } from "components/custom-hook/streaming/useLivestreamOngoingPoll"
import { useStreamingContext } from "../../context"
import { PollCard } from "./PollCard"
import { PollCardSkeleton } from "./PollCardSkeleton"
import { EmptyPollsView } from "./EmptyPollsView"
import { useLivestreamMostRecentClosedPoll } from "components/custom-hook/streaming/useLivestreamMostRecentClosedPoll"

export const ViewerPollsView = () => {
   return (
      <SuspenseWithBoundary
         fallback={<PollCardSkeleton showResultsSkeleton={false} />}
      >
         <Content />
      </SuspenseWithBoundary>
   )
}

const Content = () => {
   const { livestreamId } = useStreamingContext()

   const ongoingPoll = useLivestreamOngoingPoll(livestreamId)
   const mostRecentClosedPoll = useLivestreamMostRecentClosedPoll(livestreamId)

   const pollToShow = ongoingPoll ? ongoingPoll : mostRecentClosedPoll

   if (!pollToShow) {
      return <EmptyPollsView />
   }

   return (
      <Stack overflow="hidden" spacing={1.5}>
         <Slide in={Boolean(pollToShow)} unmountOnExit direction="up">
            {pollToShow ? (
               <PollCard
                  poll={pollToShow}
                  showResults={pollToShow.state === "closed"}
               />
            ) : (
               <PollCardSkeleton noBorder showResultsSkeleton={false} />
            )}
         </Slide>
      </Stack>
   )
}
