import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { Box, ButtonBase, Collapse, Stack, Typography } from "@mui/material"
import { useStopLivestreamPoll } from "components/custom-hook/streaming/useStopLivestreamPoll"
import { useLivestreamPollVoters } from "components/custom-hook/streaming/useLivestreamPollVoters"
import dynamic from "next/dynamic"
import React, { useCallback, useState } from "react"
import { ChevronDown, ChevronUp } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { PollOptionResult } from "./PollOptionResult"

const CreateOrEditPollForm = dynamic(() =>
   import("./CreateOrEditPollForm").then((mod) => mod.CreateOrEditPollForm)
)
const PollOptionsMenu = dynamic(() =>
   import("./PollOptionsMenu").then((mod) => mod.PollOptionsMenu)
)

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
      p: 0,
      "& svg": {
         width: 24,
         height: 24,
      },
   },
   action: {
      py: 3,
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
      const [showResults, setShowResults] = useState(poll.state !== "closed")
      const [isEditing, setIsEditing] = useState(false)

      const { livestreamId, isHost } = useStreamingContext()
      const { data: voters } = useLivestreamPollVoters(livestreamId, poll.id)

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

      if (isEditing && isHost) {
         return (
            <CreateOrEditPollForm
               poll={poll}
               onSuccess={() => setIsEditing(false)}
            />
         )
      }

      return (
         <Box sx={styles.root} ref={ref}>
            <Stack direction="row" justifyContent="space-between">
               <Typography fontWeight={600} variant="medium" color="primary">
                  {POLL_STATUS_TEXT[poll.state]}
               </Typography>
               {Boolean(isHost) && (
                  <PollOptionsMenu
                     selectedPollId={poll.id}
                     onClickEdit={() => setIsEditing(true)}
                  />
               )}
            </Stack>
            <Box pt={1.25} />
            <Typography sx={styles.question}>{poll.question}</Typography>
            <Box pt={1.5} />
            <Collapse in={showResults}>
               <Stack spacing={1}>
                  {poll.options.map((option, index) => (
                     <PollOptionResult
                        key={option.id}
                        option={option}
                        color={POLL_COLORS[index]}
                        stats={calculateOptionStats(option.id)}
                     />
                  ))}
               </Stack>
               <PollActionButton poll={poll} />
            </Collapse>
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
         </Box>
      )
   }
)

type PollActionButtonProps = {
   poll: LivestreamPoll
}

const PollActionButton = ({ poll }: PollActionButtonProps) => {
   const { livestreamId, streamerAuthToken } = useStreamingContext()

   const { trigger: stopPoll, isMutating } = useStopLivestreamPoll(
      livestreamId,
      poll.id,
      streamerAuthToken
   )

   return (
      <Box sx={styles.action}>
         {poll.state === "upcoming" && (
            <LoadingButton color="primary" variant="outlined" fullWidth>
               Start poll
            </LoadingButton>
         )}
         {poll.state === "current" && (
            <LoadingButton
               color="primary"
               variant="contained"
               fullWidth
               onClick={() => stopPoll()}
               loading={isMutating}
            >
               Close poll
            </LoadingButton>
         )}
      </Box>
   )
}

PollCard.displayName = "PollCard"
