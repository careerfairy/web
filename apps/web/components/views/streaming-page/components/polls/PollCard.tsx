import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import {
   Box,
   ButtonBase,
   ButtonBaseProps,
   Collapse,
   Stack,
   Typography,
} from "@mui/material"
import { useStopLivestreamPoll } from "components/custom-hook/streaming/useStopLivestreamPoll"
import dynamic from "next/dynamic"
import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { useStartLivestreamPoll } from "components/custom-hook/streaming/useStartLivestreamPoll"
import { PollOptions } from "./PollOptions"

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

export const PollCard = React.forwardRef<HTMLDivElement, Props>(
   ({ poll }, ref) => {
      const [showResults, setShowResults] = useState(poll.state !== "closed")
      const [isEditing, setIsEditing] = useState(false)

      const { isHost } = useStreamingContext()

      const handleCloseForm = () => {
         setIsEditing(false)
      }

      const showActionButton =
         poll.state === "upcoming" || poll.state === "current"

      if (isEditing && isHost) {
         return (
            <CreateOrEditPollForm
               poll={poll}
               onSuccess={handleCloseForm}
               onCancel={handleCloseForm}
            />
         )
      }

      return (
         <Box sx={styles.root} ref={ref}>
            <Stack direction="row" justifyContent="space-between">
               <Typography fontWeight={600} variant="medium" color="primary">
                  {POLL_STATUS_TEXT[poll.state]}
               </Typography>
               {Boolean(isHost && showResults) && (
                  <PollOptionsMenu
                     selectedPollId={poll.id}
                     onClickEdit={() => setIsEditing(true)}
                  />
               )}
            </Stack>
            <Box pt={1.25} />
            <Typography sx={styles.question}>{poll.question}</Typography>
            <Box pt={1.5} />
            <Collapse unmountOnExit in={showResults}>
               <PollOptions poll={poll} />
               {Boolean(showActionButton) && <PollActionButton poll={poll} />}
            </Collapse>
            <CollapseButton
               showResults={showResults}
               onClick={() => setShowResults((prev) => !prev)}
               paddedTop={Boolean(showResults && !showActionButton)}
            />
         </Box>
      )
   }
)

type CollapseButtonProps = {
   showResults: boolean
   onClick: ButtonBaseProps["onClick"]
   paddedTop?: boolean
}

const CollapseButton = ({
   showResults,
   onClick,
   paddedTop,
}: CollapseButtonProps) => {
   return (
      <Stack
         justifyContent="space-between"
         alignItems="center"
         direction="row"
         sx={[styles.expandButton, paddedTop && { pt: 3 }]}
         component={ButtonBase}
         onClick={onClick}
      >
         <Typography variant="small" color="neutral.600">
            {showResults ? "Collapse" : "Expand"}
         </Typography>
         {showResults ? <ChevronUp /> : <ChevronDown />}
      </Stack>
   )
}

type PollActionButtonProps = {
   poll: LivestreamPoll
}

const PollActionButton = ({ poll }: PollActionButtonProps) => {
   const { livestreamId, streamerAuthToken } = useStreamingContext()

   const { trigger: stopPoll, isMutating: stopPollMutating } =
      useStopLivestreamPoll(livestreamId, poll.id, streamerAuthToken)

   const { trigger: startPoll, isMutating: startPollMutating } =
      useStartLivestreamPoll(livestreamId, poll.id, streamerAuthToken)

   const loading = stopPollMutating || startPollMutating

   return (
      <Box sx={styles.action}>
         {poll.state === "upcoming" && (
            <LoadingButton
               color="primary"
               variant="outlined"
               fullWidth
               onClick={() => startPoll()}
               loading={loading}
            >
               Start poll
            </LoadingButton>
         )}
         {poll.state === "current" && (
            <LoadingButton
               color="primary"
               variant="contained"
               fullWidth
               onClick={() => stopPoll()}
               loading={loading}
            >
               Close poll
            </LoadingButton>
         )}
      </Box>
   )
}

PollCard.displayName = "PollCard"
