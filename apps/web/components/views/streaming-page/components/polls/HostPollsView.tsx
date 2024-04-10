import { Box, Collapse, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamPolls } from "components/custom-hook/streaming/useLivestreamPolls"
import { useMemo, useState } from "react"
import { TransitionGroup } from "react-transition-group"
import { useStreamingContext } from "../../context"
import { PollCard } from "./PollCard"
import { PollCardSkeleton } from "./PollCardSkeleton"
import { PollCreationButton } from "./PollCreationButton"
import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"

export const HostPollsView = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content />
      </SuspenseWithBoundary>
   )
}

const customSortPolls = (a: LivestreamPoll, b: LivestreamPoll) => {
   const priority: Record<LivestreamPoll["state"], number> = {
      current: 1,
      upcoming: 2,
      closed: 3,
   }
   return priority[a.state] - priority[b.state]
}

const Content = () => {
   const { livestreamId, isHost } = useStreamingContext()
   const { data: polls } = useLivestreamPolls(livestreamId)

   const orderedPolls = useMemo(() => [...polls].sort(customSortPolls), [polls])

   const [isCreatePollFormOpen, setIsCreatePollFormOpen] = useState(false)

   const hasPolls = polls.length > 0

   return (
      <Stack spacing={1.5}>
         {isHost ? (
            <PollCreationButton
               setIsCreatePollFormOpen={setIsCreatePollFormOpen}
               isCreatePollFormOpen={isCreatePollFormOpen}
               hasPolls={hasPolls}
            />
         ) : null}
         <Stack spacing={1} component={TransitionGroup}>
            {orderedPolls.map((poll) => (
               <Collapse key={poll.id}>
                  <Box>
                     <SuspenseWithBoundary fallback={<PollCardSkeleton />}>
                        <PollCard poll={poll} />
                     </SuspenseWithBoundary>
                  </Box>
               </Collapse>
            ))}
         </Stack>
      </Stack>
   )
}

const Loader = () => {
   return (
      <Stack spacing={1}>
         <PollCardSkeleton />
         <PollCardSkeleton />
      </Stack>
   )
}
