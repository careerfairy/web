import { Skeleton, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   details: {
      alignItems: "center",
   },
})

export const UserDetailsSkeleton = () => {
   return (
      <Stack direction="row" spacing={1} sx={styles.details}>
         <Skeleton width={29} height={29} variant="circular" />
         <Typography color="neutral.800" fontWeight={600} variant="small">
            <Skeleton width={100} />
         </Typography>
      </Stack>
   )
}
