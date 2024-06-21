import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import {
   Box,
   Collapse,
   Grow,
   LinearProgress,
   Stack,
   Typography,
   linearProgressClasses,
} from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: (theme) => ({
      fontFamily: "inherit",
      position: "relative",
      overflow: "hidden",
      borderRadius: "8px",
      p: 2,
      border: `1px solid ${theme.brand.white[500]}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      transition: (theme) => theme.transitions.create("box-shadow"),
      boxSizing: "border-box",
      background: theme.brand.white[200],
   }),
   buttonRoot: {
      "&:hover, &:focus": {
         backgroundColor: (theme) => theme.palette.action.hover,
      },
   },
   coloredEdge: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 5,
      height: "100%",
      transition: (theme) => theme.transitions.create("width"),
   },
   nowWidth: {
      width: 0,
   },
   progress: {
      borderRadius: "6px",
      [`&.${linearProgressClasses.colorPrimary}`]: {
         borderRadius: "6px",
         backgroundColor: (theme) => theme.brand.black[400],
      },
      height: 5,
   },
   voteIcon: {
      width: 24,
      height: 24,
      backgroundColor: "neutral.50",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: (theme) => theme.transitions.create("background-color"),
   },
   voteIconDisabled: {
      backgroundColor: (theme) => theme.brand.white[400],
   },
   voteIconActive: {
      backgroundColor: "secondary.50",
   },
   voteIconDot: {
      width: 12,
      height: 12,
      bgcolor: "neutral.800",
      borderRadius: "50%",
   },
   voteIconDotDisabled: {
      bgcolor: (theme) => theme.brand.black[600],
   },
})

type Props = {
   option: LivestreamPoll["options"][number]
   color: string
   /**
    * Indicates if the current user has voted for this option.
    */
   isOptionVoted: boolean
   /**
    * Determines if voting is enabled for the poll.
    */
   enableVoting: boolean
   /**
    * Indicates if the vote icon should be shown.
    */
   showVoteIcon: boolean
   /**
    * Indicates if the current user has voted for any option in the poll.
    */
   someOptionVoted: boolean
   /**
    * Indicates if the current user is voting for this option.
    */
   isVoting: boolean
   /**
    * Callback to trigger the vote for the option.
    */
   onVote: () => void
   showResults: boolean
   stats: {
      percentage: number
      votes: number
   }
}

export const PollOptionResult = ({
   option,
   color,
   stats,
   enableVoting,
   showVoteIcon,
   someOptionVoted,
   isOptionVoted,
   onVote,
   isVoting,
   showResults,
}: Props) => {
   const showBorderHighlight = (enableVoting || showResults) && isOptionVoted

   const disableOnClick = !enableVoting || isVoting || isOptionVoted

   return (
      <Box
         component={enableVoting ? LoadingButton : Box}
         onClick={disableOnClick ? undefined : onVote}
         disabled={!enableVoting}
         aria-label={option.text}
         sx={[
            styles.root,
            enableVoting && styles.buttonRoot,
            showBorderHighlight && {
               boxShadow: `inset 0 0 0 1.5px ${color} !important`,
            },
            { color },
         ]}
      >
         <Stack direction="row" width="100%" alignItems="center" spacing={1.5}>
            {Boolean(showVoteIcon) && (
               <span>
                  <VoteIcon disabled={!enableVoting} hasVoted={isOptionVoted} />
               </span>
            )}
            <Box width="100%">
               <Stack
                  direction="row"
                  color="neutral.800"
                  justifyContent="space-between"
               >
                  <Typography variant="small" textAlign="start">
                     {option.text}
                  </Typography>
                  <Grow in={showResults}>
                     <Typography variant="small" fontWeight={600}>
                        {stats.percentage}%
                     </Typography>
                  </Grow>
               </Stack>
               <Collapse unmountOnExit in={showResults}>
                  <Box pt={1.1875} />
                  <LinearProgress
                     value={stats.percentage}
                     variant="determinate"
                     sx={[
                        styles.progress,
                        {
                           [`& .${linearProgressClasses.bar}`]: {
                              backgroundColor: color,
                              borderRadius: "6px",
                           },
                        },
                     ]}
                  />
                  <Box pt={1.1875} />

                  <Typography
                     textAlign="start"
                     variant="xsmall"
                     color="neutral.400"
                     sx={{ display: "flex" }}
                  >
                     {stats.votes} votes
                  </Typography>
               </Collapse>
            </Box>
         </Stack>
         <Box
            sx={[
               styles.coloredEdge,
               { backgroundColor: color },
               someOptionVoted && styles.nowWidth,
            ]}
         />
      </Box>
   )
}

type VoteIconProps = {
   hasVoted: boolean
   disabled: boolean
}

const VoteIcon = ({ hasVoted, disabled }: VoteIconProps) => {
   return (
      <Box
         sx={[
            styles.voteIcon,
            hasVoted && styles.voteIconActive,
            disabled && styles.voteIconDisabled,
         ]}
      >
         <Grow in={hasVoted}>
            <Box
               sx={[styles.voteIconDot, disabled && styles.voteIconDotDisabled]}
            />
         </Grow>
      </Box>
   )
}
