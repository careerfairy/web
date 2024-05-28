import { Box, Skeleton, Stack, Typography } from "@mui/material"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { CommentCardSkeleton } from "./CommentCardSkeleton"
import { questionCardStyles } from "./QuestionCard"

const styles = sxStyles({
   input: {
      borderRadius: "24px",
      height: "33px",
      width: "100%",
   },
   toggleLike: {
      borderRadius: "10px",
      width: 70,
   },
})

export const QuestionCardSkeleton = forwardRef<HTMLDivElement>((_, ref) => {
   return (
      <Box sx={questionCardStyles.root} ref={ref}>
         <Stack spacing={3} p={1.5} pt={1.5}>
            <Typography variant="brandedBody">
               <Skeleton width="80%" />
            </Typography>
            <Stack spacing={3}>
               <Skeleton variant="rectangular" sx={styles.toggleLike} />
               <Stack spacing={1.5}>
                  <Stack spacing={1}>
                     <Skeleton variant="rectangular" sx={styles.input} />
                     <CommentCardSkeleton />
                  </Stack>
               </Stack>
            </Stack>
         </Stack>
      </Box>
   )
})

QuestionCardSkeleton.displayName = "QuestionCardSkeleton"
