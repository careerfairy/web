import { Box, Collapse, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamPolls } from "components/custom-hook/streaming/useLivestreamPolls"
import { useMemo, useState } from "react"
import { TransitionGroup } from "react-transition-group"
import { useStreamingContext } from "../../context"
import { PollCard } from "./PollCard"
import { PollCardSkeleton } from "./PollCardSkeleton"
import { PollCreationButton } from "./PollCreationButton"

export const PollsView = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content />
      </SuspenseWithBoundary>
   )
}

const Content = () => {
   const { livestreamId, isHost } = useStreamingContext()
   const { data: polls } = useLivestreamPolls(livestreamId)

   // We always want to show the current/ongoing poll(s) first
   const orderedPolls = useMemo(() => {
      const currentPolls = polls.filter((poll) => poll.state === "current")
      const otherPolls = polls.filter((poll) => poll.state !== "current")
      return [...currentPolls, ...otherPolls]
   }, [polls])

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
