import { Typography } from "@mui/material"
import { FallbackComponent } from "./FallbackComponent"

export const SparksLoadingFallback = () => {
   return (
      <FallbackComponent
         header={
            <Typography
               variant="brandedH4"
               color="neutral.800"
               fontWeight="600"
            >
               Sparks
            </Typography>
         }
         sx={{
            mb: 4,
            ml: 2,
         }}
      />
   )
}
