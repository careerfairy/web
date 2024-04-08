import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   Skeleton,
   Stack,
   Typography,
   linearProgressClasses,
} from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { LinearProgress } from "@mui/material"

const styles = sxStyles({
   root: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "6px",
      p: 2,
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
   },
   coloredEdge: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 5,
      height: "100%",
   },
   progress: {
      borderRadius: "6px",
      [`&.${linearProgressClasses.colorPrimary}`]: {
         backgroundColor: "transparent",
      },
      height: 5,
   },
})

type Props = {
   option: LivestreamPoll["options"][number]
   color: string
   stats: {
      percentage: number
      votes: number
   }
}

export const PollOptionResult = ({ option, color, stats }: Props) => {
   return (
      <Box sx={styles.root}>
         <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
               <Typography color="neutral.800" variant="medium">
                  {option.text}
               </Typography>
               <Typography
                  color="neutral.800"
                  variant="medium"
                  fontWeight={600}
               >
                  {stats.percentage}%
               </Typography>
            </Stack>
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
            <Typography variant="xsmall" color="neutral.400">
               {stats.votes} votes
            </Typography>
         </Stack>
         <Box sx={[styles.coloredEdge, { backgroundColor: color }]} />
      </Box>
   )
}

export const PollOptionResultSkeleton = () => {
   return (
      <Box sx={styles.root}>
         <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
               <Typography variant="medium">
                  <Skeleton variant="text" width="20%" />
               </Typography>
               <Typography variant="medium">
                  <Skeleton variant="text" width="10%" />
               </Typography>
            </Stack>
         </Stack>
         <Box sx={[styles.coloredEdge, { backgroundColor: "grey.500" }]} />
      </Box>
   )
}
