import { Box, Stack } from "@mui/material"
import SparksCarouselSkeleton from "components/views/admin/sparks/general-sparks-view/SparksCarouselSkeleton"
import { ReactNode } from "react"

type Props = {
   header: ReactNode
}

export const FallbackComponent = ({ header }: Props) => {
   return (
      <Box>
         <Stack direction={"column"} sx={{ gap: "10px" }}>
            {header}
            <SparksCarouselSkeleton numSlides={8} />
         </Stack>
      </Box>
   )
}
