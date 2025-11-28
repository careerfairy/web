import { Skeleton, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   ratingBar: {
      borderRadius: 1,
   },
   questionCard: {
      borderRadius: 2,
      height: 72,
   },
   mobileQuestionCard: {
      borderRadius: 2,
      width: 224,
      height: 100,
      flexShrink: 0,
   },
})

export const FeedbackDialogSkeleton = () => {
   const isMobile = useIsMobile()

   return (
      <Stack spacing={4}>
         {/* Header skeleton */}
         <Stack spacing={0.5}>
            <Skeleton
               variant="text"
               width={isMobile ? 140 : 180}
               height={isMobile ? 16 : 20}
            />
            <Skeleton
               variant="text"
               width={isMobile ? "80%" : "60%"}
               height={isMobile ? 28 : 36}
            />
         </Stack>

         {/* Question and stats skeleton */}
         <Stack spacing={2}>
            {/* Question text */}
            <Skeleton
               variant="text"
               width={isMobile ? "90%" : "70%"}
               height={isMobile ? 24 : 28}
            />

            {/* Rating overview skeleton */}
            <Stack
               direction={isMobile ? "column" : "row"}
               spacing={isMobile ? 3 : 4}
            >
               {/* Average rating circle */}
               <Stack
                  alignItems="center"
                  spacing={1}
                  sx={{ minWidth: isMobile ? "auto" : 120 }}
               >
                  <Skeleton variant="circular" width={80} height={80} />
                  <Skeleton variant="text" width={60} height={20} />
               </Stack>

               {/* Rating bars */}
               <Stack spacing={1} flex={1} width="100%">
                  {[5, 4, 3, 2, 1].map((rating) => (
                     <Stack
                        key={rating}
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                     >
                        <Skeleton variant="text" width={16} height={20} />
                        <Skeleton
                           variant="rectangular"
                           sx={styles.ratingBar}
                           width="100%"
                           height={12}
                        />
                        <Skeleton variant="text" width={30} height={20} />
                     </Stack>
                  ))}
               </Stack>
            </Stack>
         </Stack>

         {/* Other questions section skeleton */}
         <Stack spacing={2}>
            <Skeleton variant="text" width={180} height={24} />

            {isMobile ? (
               <Stack direction="row" spacing={1} overflow="hidden">
                  {[1, 2].map((i) => (
                     <Skeleton
                        key={i}
                        variant="rectangular"
                        sx={styles.mobileQuestionCard}
                     />
                  ))}
               </Stack>
            ) : (
               <Stack spacing={1.5}>
                  {[1, 2].map((i) => (
                     <Skeleton
                        key={i}
                        variant="rectangular"
                        sx={styles.questionCard}
                     />
                  ))}
               </Stack>
            )}
         </Stack>
      </Stack>
   )
}
