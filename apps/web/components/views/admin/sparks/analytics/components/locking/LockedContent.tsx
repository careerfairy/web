import { Box } from "@mui/material"

export const LockedContent = ({ children }) => {
   return (
      <Box
         sx={{
            filter: "brightness(0.97) blur(15px)",
         }}
      >
         {children}
      </Box>
   )
}
