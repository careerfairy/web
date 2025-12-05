import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { Stack } from "@mui/material"
import { useLivestreamPollVoters } from "components/custom-hook/streaming/useLivestreamPollVoters"
import { useVoteLivestreamPollOption } from "components/custom-hook/streaming/useVoteLivestreamPollOption"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback, useMemo } from "react"
import { useOpenStream } from "store/selectors/streamingAppSelectors"
import { useStreamingContext } from "../../context"
import {
   POLL_COLORS,
   PollOptionResult,
   PollOptionResultSkeleton,
} from "./PollOptionResult"

type PollOptionsProps = {
   poll: LivestreamPoll
   showResults?: boolean
}

export const PollOptions = ({ poll, showResults }: PollOptionsProps) => {
   return (
      <SuspenseWithBoundary
         fallback={
            <Stack spacing={1}>
               {Array.from({ length: poll.options.length || 3 }, (_, index) => (
                  <PollOptionResultSkeleton key={index} />
               ))}
            </Stack>
         }
      >
         <Content poll={poll} showResults={showResults} />
      </SuspenseWithBoundary>
   )
}

const Content = ({ poll, showResults }: PollOptionsProps) => {
   const { authenticatedUser } = useAuth()

   const { livestreamId, agoraUserId, isHost } = useStreamingContext()
   const { data: voters } = useLivestreamPollVoters(livestreamId, poll)

   const isOpenStream = useOpenStream()

   const userId = isOpenStream
      ? agoraUserId
      : authenticatedUser?.email || agoraUserId

   const { trigger: votePollOption, isMutating: isVoting } =
      useVoteLivestreamPollOption(livestreamId, poll.id, userId)

   const userVote = useMemo(() => {
      return voters.find((voter) => voter.userId === userId)
   }, [userId, voters])

   const calculateOptionStats = useCallback(
      (optionId: string) => {
         const votersForOption = voters.filter(
            (voter) => voter.optionId === optionId
         )
         const percentage =
            voters.length > 0
               ? Math.round((votersForOption.length / voters.length) * 100)
               : 0

         return {
            percentage,
            votes: votersForOption.length,
         }
      },
      [voters]
   )

   return (
      <Stack spacing={1}>
         {poll.options.map((option, index) => (
            <PollOptionResult
               key={option.id}
               option={option}
               color={POLL_COLORS[index]}
               stats={calculateOptionStats(option.id)}
               enableVoting={!isHost && !showResults}
               isOptionVoted={userVote?.optionId === option.id}
               someOptionVoted={Boolean(userVote)}
               isVoting={isVoting}
               showVoteIcon={!isHost}
               showResults={isHost || Boolean(userVote) || showResults}
               onVote={() => votePollOption({ optionId: option.id })}
            />
         ))}
      </Stack>
   )
}
