import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"

export const SkeletonAdminPage = () => {
   return (
      <Box p={1}>
         <Skeleton animation="wave" variant="rectangular" height={120} />
         <Skeleton animation="wave" height={40} />
         <Stack mt={3} spacing={1}>
            <Skeleton animation="wave" height={30} />
            <Skeleton animation="wave" height={30} />
            <Skeleton animation="wave" height={30} />
         </Stack>
      </Box>
   )
}

type SkeletonStackMultipleProps = {
   quantity?: number
   height?: number
   spacing?: number
}
export const SkeletonStackMultiple = ({
   quantity = 3,
   height = 50,
   spacing = 1,
}: SkeletonStackMultipleProps) => {
   return (
      <Box p={1}>
         <Stack spacing={spacing}>
            {[...Array(quantity)].map((e, i) => (
               <Skeleton
                  key={`skeleton-${i}`}
                  animation="wave"
                  height={height}
               />
            ))}
         </Stack>
      </Box>
   )
}
