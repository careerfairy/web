import { Box, Skeleton, Stack, Typography } from "@mui/material"
import React from "react"
import { sxStyles } from "types/commonTypes"
import { PollOptionResultSkeleton } from "./PollOptions"

const styles = sxStyles({
   root: {
      border: "1px solid #F8F8F8",
      borderRadius: "12px",
      p: 2,
      position: "relative",
      overflow: "hidden",
   },
   noBorder: {
      border: "none",
   },
})

type Props = {
   showResultsSkeleton?: boolean
   noBorder?: boolean
}

export const PollCardSkeleton = React.forwardRef<HTMLDivElement, Props>(
   ({ showResultsSkeleton, noBorder }, ref) => {
      return (
         <Box sx={[styles.root, noBorder && styles.noBorder]} ref={ref}>
            <Typography variant="medium" color="primary">
               <Skeleton variant="text" width={100} />
            </Typography>
            <Box pt={1.25} />
            <Typography>
               <Skeleton variant="text" width={200} />
            </Typography>
            <Box pt={1.5} />
            <Stack spacing={1}>
               <PollOptionResultSkeleton
                  showResultsSkeleton={showResultsSkeleton}
               />
               <PollOptionResultSkeleton
                  showResultsSkeleton={showResultsSkeleton}
               />
               <PollOptionResultSkeleton
                  showResultsSkeleton={showResultsSkeleton}
               />
            </Stack>
            <Box pt={0.3} />
         </Box>
      )
   }
)

PollCardSkeleton.displayName = "PollCardSkeleton"
