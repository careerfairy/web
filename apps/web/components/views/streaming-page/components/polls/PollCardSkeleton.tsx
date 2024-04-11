import { Box, Skeleton, Stack, Typography } from "@mui/material"
import React from "react"
import { sxStyles } from "types/commonTypes"
import { PollOptionResultSkeleton } from "./PollOptions"

const styles = sxStyles({
   root: {
      border: "1px solid #F8F8F8",
      borderRadius: "11px",
      p: 2,
   },
})

export const PollCardSkeleton = React.forwardRef<HTMLDivElement>((_, ref) => {
   return (
      <Box sx={styles.root} ref={ref}>
         <Typography variant="medium" color="primary">
            <Skeleton variant="text" width={100} />
         </Typography>
         <Box pt={1.25} />
         <Typography>
            <Skeleton variant="text" width={200} />
         </Typography>
         <Box pt={1.5} />
         <Stack spacing={1}>
            <PollOptionResultSkeleton />
            <PollOptionResultSkeleton />
            <PollOptionResultSkeleton />
         </Stack>
         <Box pt={0.3} />
      </Box>
   )
})

PollCardSkeleton.displayName = "PollCardSkeleton"
