import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import { Box, Button, Stack, Typography } from "@mui/material"
import useGroupHasUpcomingLivestreams from "components/custom-hook/live-stream/useGroupHasUpcomingLivestreams"
import useGroupHasSparks from "components/custom-hook/spark/useGroupHasSparks"
import { FC } from "react"
import { AlertTriangle } from "react-feather"
import { sxStyles } from "types/commonTypes"

type Props = {
   job: CustomJob
   group: Group
}

const styles = sxStyles({
   wrapper: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      alignItems: "center",
      background: "white",
      borderRadius: "16px",
      justifyContent: "center",
   },
   content: {
      maxWidth: "575px",
      alignItems: "center",
      textAlign: "center",
      py: 4,
      px: { xs: 1, md: 0 },
   },
   title: {
      fontSize: "20px",
      fontWeight: "600",
   },
   message: {
      fontSize: "16px",
      fontWeight: "400",
   },
   btn: {
      color: (theme) => theme.palette.common.white,
   },
})

const PendingContent: FC<Props> = ({ job, group }) => {
   const groupHasSparks = useGroupHasSparks(group.id, { isPublished: true })
   const groupHasLivestreams = useGroupHasUpcomingLivestreams(group.id)

   const handleClick = () => {
      // open job dialog on content section
      console.log("🚀 ~  Open form to the job: ", job.id)
   }

   // The group has no live streams and has no sparks plan
   if (!groupHasLivestreams && !group.sparksAdminPageFlag) {
      return <NoLivestreamsAndNoSparksPlan />
   }

   // The group has no live streams nor sparks
   if (!groupHasLivestreams && !groupHasSparks) {
      return <NoLivestreamsAndSparks />
   }

   return (
      <Box sx={styles.wrapper}>
         <Stack spacing={2} sx={styles.content}>
            <AlertTriangle size={48} color={"#FE9B0E"} />

            <Typography sx={styles.title}>Your job is not visible!</Typography>

            <Typography sx={styles.message}>
               Linking your job opening to Sparks or upcoming live streams is
               necessary for qualified candidates to see it.
            </Typography>

            <Button
               variant={"contained"}
               size="medium"
               color="warning"
               sx={styles.btn}
               onClick={handleClick}
            >
               Link job to content now
            </Button>
         </Stack>
      </Box>
   )
}

export default PendingContent

const NoLivestreamsAndNoSparksPlan = () => (
   <Box sx={styles.wrapper}>
      <Stack spacing={2} sx={styles.content}>
         <AlertTriangle size={48} color={"#FE9B0E"} />

         <Typography sx={styles.title}>No content to link available</Typography>

         <Typography sx={styles.message}>
            Linking your job opening to an upcoming live streams is necessary
            for qualified candidates to see it. But it seems you don’t have any
            content available yet.
         </Typography>

         <Typography sx={styles.message}>
            Create a new live stream to showcase your brand and attract top
            qualified candidates.
         </Typography>
      </Stack>
   </Box>
)

const NoLivestreamsAndSparks = () => (
   <Box sx={styles.wrapper}>
      <Stack spacing={2} sx={styles.content}>
         <AlertTriangle size={48} color={"#FE9B0E"} />

         <Typography sx={styles.title}>No content to link available</Typography>

         <Typography sx={styles.message}>
            Linking your job opening to Sparks or upcoming live streams is
            necessary for qualified candidates to see it. But it seems you don’t
            have any content available yet.
         </Typography>

         <Typography sx={styles.message}>
            Create a Spark or a live stream to showcase your brand and attract
            top qualified candidates.
         </Typography>
      </Stack>
   </Box>
)
