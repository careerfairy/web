import { Box, Stack, SxProps } from "@mui/material"
import SparksCarouselSkeleton from "components/views/admin/sparks/general-sparks-view/SparksCarouselSkeleton"
import { ReactNode } from "react"
import { combineStyles } from "types/commonTypes"

type Props = {
   header: ReactNode
   sx?: SxProps
}

export const FallbackComponent = ({ header, sx }: Props) => {
   return (
      <Box>
         <Stack direction={"column"} sx={combineStyles({ gap: 2 }, sx)}>
            {header}
            <SparksCarouselSkeleton numSlides={8} />
         </Stack>
      </Box>
   )
}
