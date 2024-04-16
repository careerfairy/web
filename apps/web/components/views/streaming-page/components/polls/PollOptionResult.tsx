import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { Grow, Collapse } from "@mui/material"
import {
   Box,
   LinearProgress,
   Stack,
   Typography,
   linearProgressClasses,
} from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      fontFamily: "inherit",
      position: "relative",
      overflow: "hidden",
      borderRadius: "6px",
      p: 2,
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      "&:hover, &:focus": {
         backgroundColor: (theme) => theme.palette.action.hover,
      },
      transition: (theme) => theme.transitions.create("border"),
   },
   customHorizontalPadding: {
      px: 1.75,
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
   voteIconActive: {
      backgroundColor: "secondary.50",
   },
   voteIconDot: {
      width: 12,
      height: 12,
      bgcolor: "neutral.800",
      borderRadius: "50%",
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
   someOptionVoted,
   isOptionVoted,
   onVote,
   isVoting,
   showResults,
}: Props) => {
   const showBorderHighlight = enableVoting && isOptionVoted

   return (
      <LoadingButton
         onClick={enableVoting ? onVote : undefined}
         disabled={isOptionVoted || !enableVoting || isVoting}
         aria-label={option.text}
         sx={[
            styles.root,
            enableVoting && styles.customHorizontalPadding,
            showBorderHighlight && {
               border: `1.5px solid ${color}`,
            },
            { color },
         ]}
      >
         <Stack direction="row" width="100%" alignItems="center" spacing={1.5}>
            {Boolean(enableVoting) && (
               <span>
                  <VoteIcon hasVoted={isOptionVoted} />
               </span>
            )}
            <Stack width="100%" spacing={1}>
               <Stack direction="row" justifyContent="space-between">
                  <Typography color="neutral.800" variant="medium">
                     {option.text}
                  </Typography>
                  <Grow in={showResults}>
                     <Typography
                        color="neutral.800"
                        variant="medium"
                        fontWeight={600}
                     >
                        {stats.percentage}%
                     </Typography>
                  </Grow>
               </Stack>
               <Collapse unmountOnExit in={showResults}>
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
                  <Typography
                     textAlign="start"
                     variant="xsmall"
                     color="neutral.400"
                     sx={{ display: "flex" }}
                  >
                     {stats.votes} votes
                  </Typography>
               </Collapse>
            </Stack>
         </Stack>
         <Box
            sx={[
               styles.coloredEdge,
               { backgroundColor: color },
               someOptionVoted && styles.nowWidth,
            ]}
         />
      </LoadingButton>
   )
}

type VoteIconProps = {
   hasVoted: boolean
}

const VoteIcon = ({ hasVoted }: VoteIconProps) => {
   return (
      <Box sx={[styles.voteIcon, hasVoted && styles.voteIconActive]}>
         <Grow in={hasVoted}>
            <Box sx={styles.voteIconDot} />
         </Grow>
      </Box>
   )
}
