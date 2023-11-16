import { useMediaQuery } from "@mui/material"
import { useIsMobile } from "./useIsMobile"

export const useIsLandscape = () => {
   const isMobile = useIsMobile("desktop")
   const isLandscape = useMediaQuery("(orientation: landscape)")

   return isMobile && isLandscape
}
