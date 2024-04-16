import { Slide, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamOngoingPoll } from "components/custom-hook/streaming/useLivestreamOngoingPoll"
import { useStreamingContext } from "../../context"
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

   return (
      <Stack overflow="hidden" spacing={1.5}>
         <Slide in={Boolean(ongoingPoll)} unmountOnExit direction="up">
            {ongoingPoll ? (
               <PollCard poll={ongoingPoll} />
            ) : (
               <PollCardSkeleton showResultsSkeleton={false} />
            )}
         </Slide>
      </Stack>
   )
}
