import { Box, Skeleton, Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   contentWrapper: {
      display: "flex",
      flexDirection: "row",
      width: "-webkit-fill-available",
   },
   skeletonChip: {
      height: 32,
      width: {
         xs: 60,
         sm: 80,
      },
      borderRadius: 16,
      flexShrink: 0,
   },
   skeletonWrapper: {
      overflowX: "auto",
      width: "100%",
      "&::-webkit-scrollbar": {
         display: "none",
      },
      msOverflowStyle: "none",
      scrollbarWidth: "none",
   },
})

export const TagsCarouselSkeleton = () => {
   return (
      <Stack spacing={1.25} direction={"row"} mb={3}>
         <Box sx={styles.contentWrapper} pr={3}>
            <Box sx={styles.skeletonWrapper}>
               <Stack direction={"row"} spacing={"12px"} pl={2} pr={2}>
                  {Array.from({ length: 18 }).map((_, index) => (
                     <Skeleton
                        key={index}
                        variant="rounded"
                        sx={styles.skeletonChip}
                     />
                  ))}
               </Stack>
            </Box>
         </Box>
      </Stack>
   )
}
