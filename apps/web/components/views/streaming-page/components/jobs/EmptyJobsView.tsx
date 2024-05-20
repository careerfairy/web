import { Box, Stack, Typography } from "@mui/material"
import { Briefcase } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      display: "flex",
      padding: "24px 12px",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      spacing: 2,
      textAlign: "center",
   },
   icon: {
      color: (theme) => theme.palette.neutral[200],
   },
   textWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "stretch",
   },
   textTitle: {
      color: (theme) => theme.palette.neutral[600],
      fontWeight: 600,
      alignSelf: "stretch",
   },
   textSubtitle: {
      color: (theme) => theme.palette.neutral[500],
      fontWeight: 400,
   },
   textSmall: {
      color: (theme) => theme.palette.neutral[300],
      fontWeight: 400,
      alignSelf: "stretch",
   },
})

export const EmptyJobsView = () => {
   return (
      <Stack sx={styles.root}>
         <Box component={Briefcase} sx={styles.icon} size={48} />
         <Stack spacing={1.5} sx={styles.textWrapper}>
            <Stack spacing={0.5}>
               <Typography variant="brandedBody" sx={styles.textTitle}>
                  No jobs linked
               </Typography>

               <Typography variant="small" sx={styles.textSubtitle}>
                  There are currently no jobs linked to this live stream.
               </Typography>
            </Stack>
            <Typography variant="small" sx={styles.textSmall}>
               {"(this tab isn't visible to viewers)"}
            </Typography>
         </Stack>
      </Stack>
   )
}
