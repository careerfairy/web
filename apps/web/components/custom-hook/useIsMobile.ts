import { useMediaQuery, UseMediaQueryOptions } from "@mui/material"
import { Breakpoint, useTheme } from "@mui/material/styles"

const defaultMobileBreakpoint = "md"

/**
 * Custom hook to determine if the current viewport matches a mobile breakpoint.
 * @param {Breakpoint | number} breakpoint - The breakpoint to compare against. If not provided, defaults to "md".
 * @returns {boolean} - Returns true if the current viewport matches the provided breakpoint, false otherwise.
 */
const useIsMobile = (
   breakpoint?: Breakpoint | number,
   options?: UseMediaQueryOptions
): boolean => {
   const theme = useTheme()

   return useMediaQuery(
      theme.breakpoints.down(breakpoint || defaultMobileBreakpoint),
      options
   )
}

export default useIsMobile
