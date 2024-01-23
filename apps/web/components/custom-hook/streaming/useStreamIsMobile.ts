import { Breakpoint } from "@mui/material"
import useIsMobile from "../useIsMobile"

/**
 * This hook is used to determine if the device is mobile based on the provided breakpoint.
 * For the stream room, the mobile breakpoints are different because the layout and functionality
 * requirements of the stream room are unique and may not align with the standard mobile breakpoints.
 * This allows us to provide a more tailored user experience for mobile users in the stream room.
 */
export const useStreamIsMobile = (breakpoint?: Breakpoint | number) => {
   return useIsMobile(breakpoint || "tablet")
}
