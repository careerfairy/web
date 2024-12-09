import { Skeleton } from "@mui/material"

export const HighlightCardSkeleton = () => {
   return (
      <Skeleton
         variant="rounded"
         width="100%"
         height="100%"
         sx={{
            width: {
               xs: 168,
               md: 220,
            },
         }}
      />
   )
}
