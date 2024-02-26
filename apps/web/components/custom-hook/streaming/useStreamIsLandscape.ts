import { useMediaQuery } from "@mui/material"
import { useStreamIsMobile } from "./useStreamIsMobile"

export const useStreamIsLandscape = () => {
   const isMobile = useStreamIsMobile()
   const isLandscape = useMediaQuery("(orientation: landscape)")

   return isMobile && isLandscape
}
