import { Box, Skeleton, Stack, Typography } from "@mui/material"
import React from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      border: "1px solid #F8F8F8",
      borderRadius: "11px",
      p: 2,
   },
   coloredEdge: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 5,
      height: "100%",
      backgroundColor: "grey.500",
   },
   skeletonProgress: {
      borderRadius: "6px",
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
            {Array.from({ length: 3 }, (_, index) => (
               <PollOptionResultSkeleton key={index} />
            ))}
         </Stack>
         <Box pt={0.3} />
      </Box>
   )
})

const PollOptionResultSkeleton = () => {
   return (
      <Box sx={styles.root}>
         <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
               <Typography variant="medium">
                  <Skeleton variant="text" width={30} />
               </Typography>
               <Typography variant="medium">
                  <Skeleton variant="text" width={20} />
               </Typography>
            </Stack>
            <Skeleton
               sx={styles.skeletonProgress}
               variant="rounded"
               animation="wave"
               width={`${Math.random() * 100}%`}
               height={5}
            />
            <Typography variant="xsmall">
               <Skeleton variant="text" width={100} />
            </Typography>
         </Stack>
         <Box sx={styles.coloredEdge} />
      </Box>
   )
}

PollCardSkeleton.displayName = "PollCardSkeleton"
