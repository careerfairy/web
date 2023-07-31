import { Box, Stack, Typography } from "@mui/material"
import Skeleton from "@mui/material/Skeleton"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   creatorCardAvatar: {
      height: {
         xs: 52,
         md: 64,
      },
      width: {
         xs: 52,
         md: 64,
      },
   },
   displayName: {
      fontSize: {
         xs: "1.42857rem",
         md: "1.71429rem",
      },
   },
   position: {
      fontSize: {
         xs: "1rem",
         md: "1.14286rem",
      },
   },
})

export const CreatorDetailsSkeleton: FC = () => {
   return (
      <Stack spacing={1.25} alignItems="center" direction="row">
         <Skeleton
            variant="circular"
            sx={styles.creatorCardAvatar}
            animation="wave"
         />
         <Box>
            <Typography sx={styles.displayName} component="h5" width={180}>
               <Skeleton variant="text" animation="wave" />
            </Typography>
            <Typography sx={styles.position} component="p" width={140}>
               <Skeleton variant="text" animation="wave" />
            </Typography>
         </Box>
      </Stack>
   )
}

export default CreatorDetailsSkeleton
