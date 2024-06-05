import { Box, Skeleton, Stack, Typography } from "@mui/material"
import { JobDescriptionSkeleton } from "components/views/livestream-dialog/views/job-details/main-content/JobDescription"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   dialogTitle: {
      padding: "16px 16px 2px 0",
   },
   title: {
      display: "flex",
      justifyContent: "flex-end",
   },
   closeButton: {
      width: "32px",
      height: "32px",
      flexShrink: 0,
   },
   header: {
      display: "flex",
      padding: 1.5,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: 1.5,
      alignSelf: "stretch",
      borderRadius: "8px",
      background: (theme) => theme.brand.white[400],
   },
   companyName: {
      flex: "1 0 0",
      color: (theme) => theme.palette.neutral[800],
      fontWeight: 600,
      alignContent: "center",
   },
   jobName: {
      fontWeight: 700,
      color: "#393939",
   },
   jobIconWrapper: {
      display: "flex",
      alignItems: "center",
      gap: 0.75,
      alignSelf: "stretch",
      color: (theme) => theme.palette.neutral[500],
   },
   dialogActions: (theme) => ({
      display: "flex",
      padding: 2,
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 1.25,
      borderTop: `1px solid ${theme.brand.black[300]}`,
      background: theme.brand.white[200],
   }),
})

export const JobDialogSkeleton = () => {
   return (
      <Stack spacing={3}>
         <Stack sx={styles.header}>
            <Stack direction="row" spacing={1}>
               <Skeleton variant="circular" width={40} height={40} />
               <Typography variant={"brandedBody"} sx={styles.companyName}>
                  <Skeleton variant="text" width={50} />
               </Typography>
            </Stack>

            <Stack spacing={0.5}>
               <Typography variant={"brandedH3"} sx={styles.jobName}>
                  <Skeleton variant="text" width={150} />
               </Typography>
               <Box gap={2}>
                  <Box sx={styles.jobIconWrapper}>
                     <Typography variant={"small"}>
                        <Skeleton variant="text" width={30} />
                     </Typography>
                  </Box>
               </Box>
            </Stack>
         </Stack>
         <Stack spacing={2}>
            <JobDescriptionSkeleton />
         </Stack>
      </Stack>
   )
}
