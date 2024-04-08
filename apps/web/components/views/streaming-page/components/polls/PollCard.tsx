import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { Box, ButtonBase, Collapse, Stack, Typography } from "@mui/material"
import React, { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { PollOptionResult, PollOptionResultSkeleton } from "./PollOptionResult"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useStreamingContext } from "../../context"
import { useLivestreamPollVoters } from "components/custom-hook/streaming/useLivestreamPollVoters"
import { ChevronDown, ChevronUp } from "react-feather"

const styles = sxStyles({
   root: {
      border: "1px solid #F8F8F8",
      borderRadius: "11px",
      p: 2,
   },
   question: {
      wordBreak: "break-word",
   },
   expandButton: {
      borderRadius: "6px",
      width: "100%",
      color: "#757575",
      p: 0.4,
      "& svg": {
         width: 24,
         height: 24,
      },
   },
})

type Props = {
   poll: LivestreamPoll
}

const POLL_STATUS_TEXT = {
   closed: "Closed poll",
   current: "Ongoing",
   upcoming: "New",
} satisfies Record<LivestreamPoll["state"], string>

const POLL_COLORS = ["#00D2AA", "#FF103C", "#FFD204", "#5978FF"] as const

export const PollCard = React.forwardRef<HTMLDivElement, Props>(
   ({ poll }, ref) => {
      const { livestreamId } = useStreamingContext()
      const { data: voters } = useLivestreamPollVoters(livestreamId, poll.id)
      const [showResults, setShowResults] = useState(poll.state !== "closed")

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
         <Box sx={styles.root} ref={ref}>
            <Typography fontWeight={600} variant="medium" color="primary">
               {POLL_STATUS_TEXT[poll.state]}
            </Typography>
            <Box pt={1.25} />
            <Typography sx={styles.question}>{poll.question}</Typography>
            <Box pt={1.5} />
            <Collapse in={showResults || poll.state !== "closed"}>
               <Stack spacing={1}>
                  {poll.options.map((option, index) => (
                     <SuspenseWithBoundary
                        key={option.id}
                        fallback={<PollOptionResultSkeleton />}
                     >
                        <PollOptionResult
                           option={option}
                           color={POLL_COLORS[index]}
                           stats={calculateOptionStats(option.id)}
                        />
                     </SuspenseWithBoundary>
                  ))}
               </Stack>
            </Collapse>
            <Box pt={0.3} />
            {poll.state === "closed" && (
               <Stack
                  justifyContent="space-between"
                  alignItems="center"
                  direction="row"
                  sx={styles.expandButton}
                  component={ButtonBase}
                  onClick={() => setShowResults((prev) => !prev)}
               >
                  <Typography variant="small" color="neutral.600">
                     {showResults ? "Collapse" : "Expand"}
                  </Typography>
                  {showResults ? <ChevronUp /> : <ChevronDown />}
               </Stack>
            )}
         </Box>
      )
   }
)

PollCard.displayName = "PollCard"
