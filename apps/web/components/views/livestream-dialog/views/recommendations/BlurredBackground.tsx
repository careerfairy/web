import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"

export const BlurredBackground = styled(Box)({
   position: "absolute",
   top: 0,
   left: 0,
   right: 0,
   bottom: 0,
   background: "rgba(0, 0, 0, 0.25)",
   backdropFilter: "blur(7.5px)",
})
