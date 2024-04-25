import { Box, Collapse, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamPolls } from "components/custom-hook/streaming/useLivestreamPolls"
import { Fragment, useMemo, useState } from "react"
import { TransitionGroup } from "react-transition-group"
import { useStreamingContext } from "../../context"
import { PollCard } from "./PollCard"
import { PollCardSkeleton } from "./PollCardSkeleton"
import { PollCreationButton } from "./PollCreationButton"
import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { ConfirmDeletePollDialog } from "./ConfirmDeletePollDialog"
import { ConfirmReopenPollDialog } from "./ConfirmReopenPollDialog"

type Props = {
   onPollStarted: () => void
}

export const HostPollsView = (props: Props) => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content {...props} />
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

const Content = ({ onPollStarted }: Props) => {
   const { livestreamId, isHost } = useStreamingContext()
   const { data: polls } = useLivestreamPolls(livestreamId)
   const [pollIdToDelete, setPollIdToDelete] = useState<string | null>(null)

   const [pollIdToReopen, setPollIdToReopen] = useState<string | null>(null)

   const orderedPolls = useMemo(() => [...polls].sort(customSortPolls), [polls])

   const [isCreatePollFormOpen, setIsCreatePollFormOpen] = useState(false)

   const handleOpenPollDeleteDialog = (pollId: string) => {
      setPollIdToDelete(pollId)
   }

   const handleOpenPollReopenDialog = (pollId: string) => {
      setPollIdToReopen(pollId)
   }

   const handleClosePollDeleteDialog = () => {
      setPollIdToDelete(null)
   }

   const handleClosePollReopenDialog = () => {
      setPollIdToReopen(null)
   }

   const hasPolls = polls.length > 0

   return (
      <Fragment>
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
                           <PollCard
                              poll={poll}
                              onClickDelete={handleOpenPollDeleteDialog}
                              onClickReopen={handleOpenPollReopenDialog}
                              onPollStarted={onPollStarted}
                           />
                        </SuspenseWithBoundary>
                     </Box>
                  </Collapse>
               ))}
            </Stack>
         </Stack>
         <ConfirmDeletePollDialog
            open={Boolean(pollIdToDelete)}
            onClose={handleClosePollDeleteDialog}
            pollId={pollIdToDelete}
         />
         <ConfirmReopenPollDialog
            open={Boolean(pollIdToReopen)}
            onClose={handleClosePollReopenDialog}
            pollId={pollIdToReopen}
            onPollStarted={onPollStarted}
         />
      </Fragment>
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
