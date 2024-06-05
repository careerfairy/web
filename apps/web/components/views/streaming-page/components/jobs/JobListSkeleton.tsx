import { Box, Skeleton, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   jobList: {
      gap: 1.5,
   },
   jobCard: (theme) => ({
      display: "flex",
      alignItems: "center",
      alignSelf: "stretch",
      borderRadius: 2,
      border: `1px solid ${theme.brand.white[500]}`,
      background: theme.brand.white[100],
      overflow: "hidden",
   }),
   jobCardSideWrapper: {
      alignSelf: "stretch",
      display: "flex",
   },
   jobCardSide: {
      height: "100%",
      width: "8px",
      bgcolor: (theme) => theme.palette.primary[300],
   },
   jobInfo: {
      display: "flex",
      padding: 1.5,
      flexDirection: "column",
      gap: 1,
      flex: "1 0 0",
      alignSelf: "stretch",
   },
   jobTitle: {
      alignSelf: "stretch",
   },
   jobIconsSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      spacing: 0.25,
      alignSelf: "stretch",
   },
   jobIconWrapper: {
      display: "flex",
      alignItems: "center",
      gap: 0.75,
      alignSelf: "stretch",
      color: (theme) => theme.palette.neutral[500],
   },
   bottomText: {
      display: "flex",
      alignItems: "center",
      gap: 0.75,
      alignSelf: "stretch",
   },
   applyText: {
      display: "flex",
      height: "24px",
      flexDirection: "column",
      justifyContent: "center",
      flex: "1 0 0",
   },
   seeMore: {
      textAlign: "right",
      textOverflow: "ellipsis",
      padding: 0,
   },
})

export const JobListSkeleton = () => {
   return (
      <Stack sx={styles.jobList}>
         <JobCardSkeleton />
         <JobCardSkeleton />
      </Stack>
   )
}

export const JobCardSkeleton = () => {
   return (
      <Box sx={styles.jobCard}>
         <Box sx={styles.jobCardSideWrapper}>
            <Skeleton variant="rectangular" sx={styles.jobCardSide} />
         </Box>
         <Box sx={styles.jobInfo}>
            <Stack spacing={1}>
               <Stack>
                  <Typography variant="brandedBody">
                     <Skeleton
                        variant="rounded"
                        width={200}
                        sx={styles.jobTitle}
                     />
                  </Typography>

                  <Stack sx={styles.jobIconsSection}>
                     <Box sx={styles.jobIconWrapper}>
                        <Skeleton variant="circular" width={12} height={12} />
                        <Typography variant="small">
                           <Skeleton variant="text" width={100} />
                        </Typography>
                     </Box>
                  </Stack>
               </Stack>
               <Box sx={styles.bottomText}>
                  <Typography variant="xsmall" sx={styles.applyText}>
                     <Skeleton variant="text" width="120px" />
                  </Typography>

                  <Typography variant="xsmall">
                     <Skeleton
                        variant="text"
                        width="50px"
                        sx={styles.seeMore}
                     />
                  </Typography>
               </Box>
            </Stack>
         </Box>
      </Box>
   )
}
