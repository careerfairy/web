import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { Skeleton, Typography } from "@mui/material"
import { Box, Stack } from "@mui/material"
import { PollOptionResult } from "./PollOptionResult"
import { Fragment, useCallback, useMemo } from "react"
import { useLivestreamPollVoters } from "components/custom-hook/streaming/useLivestreamPollVoters"
import { useStreamingContext } from "../../context"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { sxStyles } from "types/commonTypes"
import { useAuth } from "HOCs/AuthProvider"
import { useOpenStream } from "store/selectors/streamingAppSelectors"
import { useVoteLivestreamPollOption } from "components/custom-hook/streaming/useVoteLivestreamPollOption"

const styles = sxStyles({
   root: {
      border: "1px solid #F8F8F8",
      borderRadius: "12px",
      p: 2,
   },
   coloredEdge: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 5,
      height: "100%",
      backgroundColor: "grey.500",
   },
   skeletonProgress: {
      borderRadius: "8px",
   },
})

type PollOptionsProps = {
   poll: LivestreamPoll
}

const POLL_COLORS = ["#00D2AA", "#FF103C", "#FFD204", "#5978FF"] as const

export const PollOptions = ({ poll }: PollOptionsProps) => {
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
         <Content poll={poll} />
      </SuspenseWithBoundary>
   )
}

const Content = ({ poll }: PollOptionsProps) => {
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
               enableVoting={!isHost}
               isOptionVoted={userVote?.optionId === option.id}
               someOptionVoted={Boolean(userVote)}
               onVote={() => votePollOption({ optionId: option.id })}
               isVoting={isVoting}
               showResults={isHost || Boolean(userVote)}
            />
         ))}
      </Stack>
   )
}

export const PollOptionResultSkeleton = ({
   showResultsSkeleton = true,
}: {
   showResultsSkeleton?: boolean
}) => {
   return (
      <Box sx={styles.root}>
         <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
               <Typography variant="medium">
                  <Skeleton variant="text" width={30} />
               </Typography>
               {Boolean(showResultsSkeleton) && (
                  <Typography variant="medium">
                     <Skeleton variant="text" width={20} />
                  </Typography>
               )}
            </Stack>
            {Boolean(showResultsSkeleton) && (
               <Fragment>
                  <Skeleton
                     sx={styles.skeletonProgress}
                     variant="rounded"
                     animation="wave"
                     width={`${Math.random() * 100}%`}
                     height={5}
                  />
                  <Typography variant="xsmall">
                     <Skeleton variant="text" width={100} />
                  </Typography>
               </Fragment>
            )}
         </Stack>
         <Box sx={styles.coloredEdge} />
      </Box>
   )
}
