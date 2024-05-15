import { Skeleton, Stack, Typography } from "@mui/material"

export const PDFPreviewSkeleton = () => {
   return (
      <Stack p={1.5} width="100%" spacing={1}>
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
