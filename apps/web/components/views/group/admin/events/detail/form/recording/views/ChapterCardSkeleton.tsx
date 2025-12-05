import { Box, Skeleton, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   chapterCard: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      width: "100%",
      minWidth: 0,
   },
   thumbnailWrapper: {
      width: (theme) => theme.spacing(11.25),
      height: (theme) => theme.spacing(6.25),
      borderRadius: 0.5,
      overflow: "hidden",
      border: "1px solid",
      borderColor: (theme) => theme.brand.white[500],
      flexShrink: 0,
      backgroundColor: (theme) => theme.brand.white[400],
      position: "relative",
   },
   thumbnailSkeleton: {
      width: "100%",
      height: "100%",
      transform: "none",
   },
   chapterContent: {
      display: "flex",
      flexDirection: "column",
      gap: 0.25,
      flexGrow: 1,
      minWidth: 0,
   },
   chapterHeader: {
      display: "flex",
      alignItems: "center",
      gap: 1.25,
      minWidth: 0,
      width: "100%",
   },
   chapterTitle: {
      flexGrow: 1,
      minWidth: 0,
      overflow: "hidden",
   },
   optionsSkeleton: {
      width: (theme) => theme.spacing(3),
      height: (theme) => theme.spacing(3),
      borderRadius: "50%",
      flexShrink: 0,
   },
   timestamp: {
      width: "40%",
   },
})

export const ChapterCardSkeleton = () => {
   return (
      <Box sx={styles.chapterCard}>
         <Box sx={styles.thumbnailWrapper}>
            <Skeleton variant="rectangular" sx={styles.thumbnailSkeleton} />
         </Box>
         <Box sx={styles.chapterContent}>
            <Box sx={styles.chapterHeader}>
               <Typography variant="small" noWrap sx={styles.chapterTitle}>
                  <Skeleton width="80%" />
               </Typography>
               <Skeleton variant="circular" sx={styles.optionsSkeleton} />
            </Box>
            <Typography variant="small">
               <Skeleton width="40%" />
            </Typography>
         </Box>
      </Box>
   )
}
