import { Skeleton, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: (theme) => ({
      p: 1.5,
      borderRadius: "8px",
      border: `1px solid ${theme.brand.purple[100]}`,
      bgcolor: theme.brand.white[300],
      overflow: "hidden",
   }),
})

export const PDFDetailsSkeleton = () => {
   return (
      <Stack sx={styles.root} width="100%" spacing={1}>
         <Stack direction="row" alignItems="center" spacing={1}>
            <Skeleton variant="circular" width={41} height={41} />
            <Stack alignItems="flex-start">
               <Typography variant="medium" color="neutral.700">
                  <Skeleton variant="text" width={150} />
               </Typography>
               <Typography variant="xsmall" color="neutral.400">
                  <Skeleton variant="text" width={50} />
               </Typography>
            </Stack>
         </Stack>
      </Stack>
   )
}
