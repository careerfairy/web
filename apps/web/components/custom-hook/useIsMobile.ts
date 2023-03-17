import { useTheme } from "@mui/material/styles"
import { Breakpoint, useMediaQuery } from "@mui/material"

const useIsMobile = (breakPoint: Breakpoint = "md"): boolean => {
   const theme = useTheme()
   return useMediaQuery(theme.breakpoints.down(breakPoint))
}

export default useIsMobile
