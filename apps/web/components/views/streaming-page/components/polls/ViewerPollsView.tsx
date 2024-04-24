import { Slide, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamMostRecentClosedPoll } from "components/custom-hook/streaming/useLivestreamMostRecentClosedPoll"
import { useLivestreamOngoingPoll } from "components/custom-hook/streaming/useLivestreamOngoingPoll"
import { useStreamingContext } from "../../context"
import { EmptyPollsView } from "./EmptyPollsView"
import { PollCard } from "./PollCard"
import { PollCardSkeleton } from "./PollCardSkeleton"

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

   const pollToShow = ongoingPoll || mostRecentClosedPoll

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
