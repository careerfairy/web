import { Breakpoint, useMediaQuery, useTheme } from "@mui/material"

export const useIsMobile = (breakpoint?: Breakpoint | number) => {
   const theme = useTheme()

   const isMobile = useMediaQuery(
      theme.breakpoints.down(breakpoint || "tablet")
   )
   return isMobile
}
