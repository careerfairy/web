import { useMediaQuery, useTheme } from "@mui/material"

export const useIsMobile = () => {
   const theme = useTheme()
   // new comment
   const isMobile = useMediaQuery(theme.breakpoints.down("tablet"))
   return isMobile
}
