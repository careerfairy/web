import { Box, Skeleton, Stack, Typography } from "@mui/material"
import { PollWithVoters } from "components/custom-hook/streaming/useAllLivestreamPolls"
import {
   POLL_COLORS,
   PollOptionResult,
   PollOptionResultSkeleton,
} from "components/views/streaming-page/components/polls/PollOptionResult"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   card: {
      border: "1px solid",
      borderColor: (theme) => theme.brand.white[500],
      backgroundColor: (theme) => theme.brand.white[100],
      borderRadius: "12px",
      p: 1.5,
      width: 335,
      flexShrink: 0,
      alignSelf: "flex-start",
   },
   totalVotes: {
      letterSpacing: "-0.3px",
      color: "#212020",
   },
   question: {
      wordBreak: "break-word",
   },
})

type PollResultCardProps = {
   poll: PollWithVoters
}

export const PollResultCard = ({ poll }: PollResultCardProps) => {
   const optionStats = useMemo(() => {
      return poll.options.map((option) => {
         const votersForOption = poll.votersData.filter(
            (voter) => voter.optionId === option.id
         )
         const percentage =
            poll.totalVotes > 0
               ? Math.round((votersForOption.length / poll.totalVotes) * 100)
               : 0

         return {
            optionId: option.id,
            percentage,
            votes: votersForOption.length,
         }
      })
   }, [poll])

   return (
      <Box sx={styles.card}>
         <Stack spacing={1}>
            <Typography
               variant="xsmall"
               color="neutral.800"
               sx={styles.totalVotes}
            >
               {poll.totalVotes} votes
            </Typography>
            <Typography
               variant="medium"
               color="neutral.800"
               sx={styles.question}
            >
               {poll.question}
            </Typography>
         </Stack>
         <Box pt={1.5} />
         <Stack spacing={1}>
            {poll.options.map((option, index) => {
               const stats = optionStats.find((s) => s.optionId === option.id)
               const color = POLL_COLORS[index % POLL_COLORS.length]

               return (
                  <PollOptionResult
                     key={option.id}
                     option={option}
                     color={color}
                     stats={stats || { percentage: 0, votes: 0 }}
                     showResults
                     enableVoting={false}
                     showVoteIcon={false}
                     isOptionVoted={false}
                     someOptionVoted={false}
                     isVoting={false}
                     onVote={() => {}}
                  />
               )
            })}
         </Stack>
      </Box>
   )
}

export const PollResultCardSkeleton = () => {
   return (
      <Box sx={styles.card}>
         <Stack spacing={1}>
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="70%" />
         </Stack>
         <Box pt={1.5} />
         <Stack spacing={1}>
            {Array.from({ length: 3 }).map((_, index) => (
               <PollOptionResultSkeleton key={index} showResultsSkeleton />
            ))}
         </Stack>
      </Box>
   )
}
