import { Skeleton, Stack, Typography } from "@mui/material"
import { forwardRef } from "react"
import { UserDetailsSkeleton } from "../UserDetailsSkeleton"
import { commentCardStyles } from "./CommentCard"

export const CommentCardSkeleton = forwardRef<HTMLDivElement>((_, ref) => {
   return (
      <Stack ref={ref} sx={commentCardStyles.root} spacing={1.25}>
         <Stack direction="row" justifyContent="space-between">
            <UserDetailsSkeleton />
         </Stack>
         <Typography variant="small" color="neutral.700">
            <Skeleton width="90%" />
         </Typography>
      </Stack>
   )
})

CommentCardSkeleton.displayName = "CommentCardSkeleton"
