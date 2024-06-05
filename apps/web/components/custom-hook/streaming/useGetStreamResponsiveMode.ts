import { useStreamIsLandscape } from "./useStreamIsLandscape"
import { useStreamIsMobile } from "./useStreamIsMobile"

export enum StreamResponsiveMode {
   Desktop = "desktop",
   Mobile = "mobile",
   Tablet = "tablet",
}

export const useGetStreamResponsiveMode = () => {
   const streamIsLandscape = useStreamIsLandscape()
   const isPortrait = useStreamIsMobile()

   if (streamIsLandscape) {
      return StreamResponsiveMode.Tablet
   }

   if (isPortrait) {
      return StreamResponsiveMode.Mobile
   }

   return StreamResponsiveMode.Desktop
}
