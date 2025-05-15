import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"

export const BlurredBackground = styled(Box)({
   background: "rgba(0, 0, 0, 0.25)",
   backdropFilter: "blur(7.5px)",
   display: "flex",
   justifyContent: "center",
   alignItems: "center",
   paddingTop: 16,
   paddingBottom: 16,
   height: "100%",
})
