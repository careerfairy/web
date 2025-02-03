import { Box, Stack, Typography } from "@mui/material"
import { Briefcase } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      padding: "32px 12px",
      alignItems: "center",
      textAlign: "center",
   },
   wrapper: {
      width: { xs: "100%", sm: "80%" },
      alignItems: "center",
   },
   icon: {
      color: (theme) => theme.palette.neutral[300],
   },
   textTitle: {
      color: (theme) => theme.palette.neutral[900],
      fontWeight: 600,
      alignSelf: "stretch",
   },
   textSubtitle: {
      color: (theme) => theme.palette.neutral[700],
      fontWeight: 400,
   },
})

export const EmptyJobsView = () => {
   return (
      <Stack sx={styles.root}>
         <Stack sx={styles.wrapper} spacing={2}>
            <Box component={Briefcase} sx={styles.icon} size={48} />
            <Stack spacing={1}>
               <Typography variant="brandedH5" sx={styles.textTitle}>
                  No jobs found
               </Typography>

               <Typography variant="medium" sx={styles.textSubtitle}>
                  We couldn’t find jobs that fit your preferences this time.
                  Tweak your search, or keep an eye out for new openings!
               </Typography>
            </Stack>
         </Stack>
      </Stack>
   )
}
