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
import { TotalVotesCount } from "./TotalVotesCount"

const CreateOrEditPollForm = dynamic(() =>
   import("./CreateOrEditPollForm").then((mod) => mod.CreateOrEditPollForm)
)
const PollOptionsMenu = dynamic(() =>
   import("./PollOptionsMenu").then((mod) => mod.PollOptionsMenu)
)

const styles = sxStyles({
   root: {
      border: "1px solid",
      borderColor: (theme) => theme.brand.white[500],
      backgroundColor: (theme) => theme.brand.white[100],
      borderRadius: "12px",
      p: 1.5,
      transition: (theme) => theme.transitions.create("box-shadow"),
   },
   greenBorder: {
      borderColor: "transparent",
      boxShadow: (theme) => `inset 0 0 0 1.5px ${theme.palette.primary.main}`,
   },
   noBorder: {
      border: "none",
   },
   question: {
      wordBreak: "break-word",
   },
   expandButton: {
      borderRadius: "6px",
      width: "100%",
      p: 0,
      fontFamily: "inherit",
      "& svg": {
         width: 24,
         height: 24,
      },
   },
   topMargin: {
      mt: 1.5,
   },
   action: {
      pt: 2,
   },
})

type Props = {
   poll: LivestreamPoll
   showResults?: boolean
   onClickDelete?: (pollId: string) => void
   onClickReopen?: (pollId: string) => void
   onPollStarted?: () => void
}

const POLL_STATUS_TEXT = {
   closed: "Closed poll",
   current: "Ongoing poll",
   upcoming: "New",
} satisfies Record<LivestreamPoll["state"], string>

export const PollCard = React.forwardRef<HTMLDivElement, Props>(
   (
      { poll, onClickDelete, onClickReopen, onPollStarted, showResults },
      ref
   ) => {
      const [showOptions, setShowOptions] = useState(
         poll.state !== "closed" || showResults
      )
      const [isEditing, setIsEditing] = useState(false)

      const { isHost } = useStreamingContext()

      const handleCloseForm = () => {
         setIsEditing(false)
      }

      const showActionButton =
         isHost && (poll.state === "upcoming" || poll.state === "current")

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
         <Box
            sx={[
               styles.root,
               poll.state === "current" && isHost && styles.greenBorder,
               !isHost && styles.noBorder,
            ]}
            ref={ref}
         >
            <Stack
               direction="row"
               justifyContent="space-between"
               alignItems="center"
            >
               <Typography
                  fontWeight={poll.state === "current" ? 600 : 400}
                  variant="small"
                  color={POLL_STATUS_TEXT_COLOR[poll.state]}
               >
                  {POLL_STATUS_TEXT[poll.state]}
               </Typography>
               {Boolean(isHost) && (
                  <PollOptionsMenu
                     poll={poll}
                     onClickEdit={() => setIsEditing(true)}
                     onClickDelete={onClickDelete}
                     onClickReopen={onClickReopen}
                  />
               )}
            </Stack>
            <Box pt={1.25} />
            <Stack>
               <Typography
                  aria-label="Poll question"
                  variant="medium"
                  color={
                     poll.state === "closed" ? "neutral.500" : "neutral.800"
                  }
                  sx={styles.question}
               >
                  {poll.question}
               </Typography>
               {poll.state === "closed" && !showResults && (
                  <TotalVotesCount poll={poll} />
               )}
            </Stack>
            <Box pt={1.5} />
            <Collapse
               unmountOnExit
               in={showOptions || poll.state === "current"}
            >
               <PollOptions poll={poll} showResults={showResults} />
               {Boolean(showActionButton) && (
                  <PollActionButton poll={poll} onPollStarted={onPollStarted} />
               )}
            </Collapse>
            {Boolean(isHost) && poll.state !== "current" && (
               <CollapseButton
                  showResults={showOptions}
                  onClick={() => setShowOptions((prev) => !prev)}
                  paddedTop={Boolean(
                     showOptions &&
                        (showActionButton || poll.state === "closed")
                  )}
                  pollClosed={poll.state === "closed"}
               />
            )}
         </Box>
      )
   }
)

type CollapseButtonProps = {
   showResults: boolean
   paddedTop?: boolean
   pollClosed?: boolean
} & ButtonBaseProps

const CollapseButton = ({
   showResults,
   paddedTop,
   pollClosed,
   ...rest
}: CollapseButtonProps) => {
   const noun = pollClosed ? "results" : "details"

   return (
      <Stack
         justifyContent="space-between"
         alignItems="center"
         direction="row"
         sx={[styles.expandButton, paddedTop && styles.topMargin]}
         component={ButtonBase}
         color={pollClosed ? "neutral.400" : "neutral.700"}
         {...rest}
      >
         <Typography variant="small">
            {showResults ? `Hide ${noun}` : `Show ${noun}`}
         </Typography>
         {showResults ? <ChevronUp /> : <ChevronDown />}
      </Stack>
   )
}

const POLL_STATUS_TEXT_COLOR = {
   current: "primary.main",
   closed: "neutral.400",
   upcoming: "primary.700",
} satisfies Record<LivestreamPoll["state"], string>

type PollActionButtonProps = {
   poll: LivestreamPoll
   onPollStarted?: () => void
}

const PollActionButton = ({ poll, onPollStarted }: PollActionButtonProps) => {
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
               onClick={() => {
                  startPoll().then(() => {
                     onPollStarted?.()
                  })
               }}
               loading={loading}
            >
               Start poll
            </LoadingButton>
         )}
         {poll.state === "current" && (
            <LoadingButton
               color="error"
               variant="outlined"
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
