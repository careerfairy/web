import { Box, Button, Stack, Typography } from "@mui/material"
import useGroupHasUpcomingLivestreams from "components/custom-hook/live-stream/useGroupHasUpcomingLivestreams"
import { useGroup } from "layouts/GroupDashboardLayout"
import { AlertTriangle } from "react-feather"
import { sxStyles } from "types/commonTypes"

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

type Props = {
   handleClick: () => void
}

const PendingContent = ({ handleClick }: Props) => {
   const { group } = useGroup()
   const groupHasUpcomingLivestreams = useGroupHasUpcomingLivestreams(
      group.groupId
   )

   // The group has no live streams nor sparks
   if (!groupHasUpcomingLivestreams && !group.publicSparks) {
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
