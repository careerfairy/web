import { Box, Skeleton, Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   card: {
      width: "100%",
      backgroundColor: (theme) => theme.brand.white[100],
      border: (theme) => `1px solid ${theme.palette.secondary[50]}`,
      borderRadius: "12px",
      overflow: "hidden",
      transition: (theme) => theme.transitions.create(["box-shadow", "border"]),
      "&:hover,&:focus": {
         border: (theme) => `1px solid ${theme.palette.secondary[100]}`,
         boxShadow: "0 0 12px 0 rgba(20, 20, 20, 0.08)",
      },
   },
   bannerWrapper: {
      position: "relative",
      width: "100%",
      aspectRatio: "3/2",
   },
   bannerSkeleton: {
      width: "100%",
      height: "100%",
   },
   content: {
      pt: 0,
      pb: 2,
      px: 0,
   },
   row: {
      px: 2,
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 1,
   },
   title: {
      px: 2,
      height: "47px",
      display: "flex",
      alignItems: "center",
   },
   detailRow: {
      px: 2,
      display: "flex",
      alignItems: "center",
      gap: 1,
   },
   iconSkeleton: {
      width: 16,
      height: 16,
      flexShrink: 0,
   },
})

export const OfflineEventCardSkeleton = () => {
   return (
      <Box sx={styles.card} data-name="Offline event card skeleton">
         <Box sx={styles.bannerWrapper}>
            <Skeleton
               variant="rectangular"
               sx={styles.bannerSkeleton}
               animation="wave"
            />
         </Box>

         <Stack sx={styles.content}>
            <Box sx={styles.row} pt={1}>
               <Skeleton
                  variant="circular"
                  width={28}
                  height={28}
                  animation="wave"
               />
               <Skeleton
                  variant="text"
                  width="40%"
                  height={24}
                  animation="wave"
               />
            </Box>

            <Box sx={styles.title} pt={1}>
               <Skeleton
                  variant="text"
                  width="90%"
                  height={24}
                  animation="wave"
               />
            </Box>

            <Box pt={1} sx={styles.detailRow}>
               <Skeleton
                  variant="circular"
                  sx={styles.iconSkeleton}
                  animation="wave"
               />
               <Skeleton
                  variant="text"
                  width="60%"
                  height={18}
                  animation="wave"
               />
            </Box>

            <Box pt={1} sx={styles.detailRow}>
               <Skeleton
                  variant="circular"
                  sx={styles.iconSkeleton}
                  animation="wave"
               />
               <Skeleton
                  variant="text"
                  width="50%"
                  height={18}
                  animation="wave"
               />
            </Box>
         </Stack>
      </Box>
   )
}
