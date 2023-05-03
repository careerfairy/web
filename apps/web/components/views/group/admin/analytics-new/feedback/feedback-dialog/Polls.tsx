import Stack from "@mui/material/Stack"
import LinearProgress, {
   linearProgressClasses,
} from "@mui/material/LinearProgress"
import { Box, Grid, Typography } from "@mui/material"
import React, { FC } from "react"
import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { collection, orderBy, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { useFirestoreCollection } from "../../../../../../custom-hook/utils/useFirestoreCollection"
import useCountQuery from "../../../../../../custom-hook/useCountQuery"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { alpha } from "@mui/material/styles"
import Skeleton from "@mui/material/Skeleton"

const styles = sxStyles({
   pollEntryRoot: {
      border: (theme) =>
         `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
      borderRadius: 4,
      p: 2,
      flex: 1,
   },
   pollOptionProgress: {
      borderRadius: 2,
      backgroundColor: "transparent",
      border: `1px solid #EDE7FD`,
      [`& .${linearProgressClasses.bar}`]: {
         backgroundColor: "#EDE7FD",
      },
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      height: "100%",
   },
   pollOptionRoot: {
      minHeight: 50,
      position: "relative",
   },
   pollOptionDetails: {
      display: "flex",
      position: "relative",
      py: 1,
      px: 1.5,
      zIndex: 1,
   },
   pollCount: {
      borderRadius: "50%",
      position: "relative",
      backgroundColor: "white",
      color: "secondary.main",
      width: 30,
      height: 30,
      minWidth: 30,
      minHeight: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& p": {
         position: "absolute",
      },
   },
   gridItem: {
      display: "flex",
   },
   pollOptionSkeleton: {
      borderRadius: 2,
   },
})

type PollsProps = {
   livestreamStats: LiveStreamStats
}
const Polls: FC<PollsProps> = ({ livestreamStats }) => {
   const { data: polls, status } = useLivestreamPolls(
      livestreamStats.livestream.id
   )

   if (status !== "loading" && polls.length === 0) return null

   return (
      <Stack spacing={2}>
         <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h5" fontWeight={600}>
               Polls during live stream
            </Typography>
         </Stack>
         <Box>
            <Grid container spacing={2}>
               {polls.map((poll) => (
                  <PollEntry
                     key={poll.id}
                     poll={poll}
                     livestreamId={livestreamStats.livestream.id}
                  />
               ))}
            </Grid>
         </Box>
      </Stack>
   )
}

type PollEntryProps = {
   poll: LivestreamPoll
   livestreamId: string
}
const PollEntry: FC<PollEntryProps> = ({ poll, livestreamId }) => {
   const { count, loading } = usePollVotersCount(livestreamId, poll.id)

   if (loading) {
      return (
         <Grid sx={styles.gridItem} item xs={12} md={6} lg={4}>
            <PollSkeleton />
         </Grid>
      )
   }

   if (count === 0) return null // no votes, so don't show

   return (
      <Grid sx={styles.gridItem} item xs={12} md={6} lg={4}>
         <Stack spacing={1} sx={styles.pollEntryRoot}>
            <Typography variant="body2">
               {loading ? "..." : count || 0} votes
            </Typography>
            <Typography variant="h6" fontWeight={600}>
               {poll.question}
            </Typography>
            <Stack spacing={2}>
               {poll.options.map((option) => (
                  <PollOption
                     key={option.id}
                     pollOption={option}
                     pollId={poll.id}
                     livestreamId={livestreamId}
                     totalVotes={count ?? 0}
                  />
               ))}
            </Stack>
         </Stack>
      </Grid>
   )
}

type PollOptionProps = {
   livestreamId: string
   pollId: string
   pollOption: LivestreamPoll["options"][number]
   totalVotes: number
}

const PollOption: FC<PollOptionProps> = ({
   pollOption,
   pollId,
   livestreamId,
   totalVotes,
}) => {
   const { count } = usePollVotersCount(livestreamId, pollId, pollOption.id)

   return (
      <Box sx={styles.pollOptionRoot}>
         <Stack
            spacing={1.1}
            direction="row"
            alignItems="center"
            sx={styles.pollOptionDetails}
         >
            <Box sx={styles.pollCount}>
               <Typography variant="body2" fontWeight={600}>
                  {count ?? 0}
               </Typography>
            </Box>
            <Typography fontSize="0.95rem" lineHeight="1.5rem" variant="body2">
               {pollOption.text}
            </Typography>
         </Stack>
         <LinearProgress
            sx={styles.pollOptionProgress}
            variant="determinate"
            value={count ? (count / totalVotes) * 100 : 0}
         />
      </Box>
   )
}

export const PollsSkeleton = () => {
   return (
      <Stack spacing={2}>
         <Stack direction="row" alignItems="center" spacing={2}>
            <Skeleton variant="text" width={200} height={40} />
         </Stack>
         <Box>
            <Grid container spacing={2}>
               {Array.from({ length: 3 }).map((_, i) => (
                  <Grid sx={styles.gridItem} key={i} item xs={12} md={6} lg={4}>
                     <PollSkeleton />
                  </Grid>
               ))}
            </Grid>
         </Box>
      </Stack>
   )
}

const PollSkeleton = () => {
   return (
      <Stack spacing={1} sx={styles.pollEntryRoot}>
         <Typography variant="body2">
            <Skeleton variant="text" width={40} />
         </Typography>
         <Typography variant="h6" width="80%">
            <Skeleton width="100%" />
         </Typography>
         <Stack spacing={2}>
            {Array.from({ length: 3 }).map((_, i) => (
               <Skeleton
                  key={i}
                  sx={styles.pollOptionSkeleton}
                  variant="rectangular"
                  width={`calc(100% * ${Math.random() * (1 - 0.5) + 0.5})`}
                  height={50}
               />
            ))}
         </Stack>
      </Stack>
   )
}

const useLivestreamPolls = (livestreamId: string) => {
   return useFirestoreCollection<LivestreamPoll>(
      query(
         collection(FirestoreInstance, "livestreams", livestreamId, "polls"),
         where("state", "!=", "upcoming"),
         orderBy("state", "asc")
      ),
      {
         idField: "id",
      }
   )
}

const usePollVotersCount = (
   livestreamId: string,
   pollId: string,
   optionId?: string
) => {
   return useCountQuery(
      query(
         collection(
            FirestoreInstance,
            "livestreams",
            livestreamId,
            "polls",
            pollId,
            "voters"
         ),
         optionId ? where("optionId", "==", optionId) : undefined
      )
   )
}

export default Polls
