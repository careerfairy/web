import { CircularProgress, Slide, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamPolls } from "components/custom-hook/streaming/useLivestreamPolls"
import React, { useState } from "react"
import { useStreamingContext } from "../../context"
import { PollCreationButton } from "./PollCreationButton"
import { PollCard } from "./PollCard"
import { TransitionGroup } from "react-transition-group"

export const PollsView = () => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <Content />
      </SuspenseWithBoundary>
   )
}

const Content = () => {
   const { livestreamId, isHost } = useStreamingContext()
   const { data: polls } = useLivestreamPolls(livestreamId)
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
            {polls.map((poll) => (
               <Slide key={poll.id} direction="up">
                  <PollCard poll={poll} />
               </Slide>
            ))}
         </Stack>
      </Stack>
   )
}
