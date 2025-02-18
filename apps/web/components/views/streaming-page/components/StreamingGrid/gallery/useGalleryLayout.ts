import {
   useSideDrawer,
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useMemo } from "react"
import { useIsSpotlightMode } from "store/selectors/streamingAppSelectors"
import { Layout } from "../types"

/**
 * A custom hook that calculates the layout for a gallery based on various conditions.
 * It considers the number of elements, device orientation, screen size, and side drawer state
 * to determine the optimal number of rows and columns for displaying content.
 *
 * @param {number} numberOfElements - The total number of elements to be displayed in the gallery.
 * @returns {Layout} The calculated layout configuration, including the number of columns and rows.
 */
export const useGalleryLayout = (numberOfElements: number): Layout => {
   const { isOpen: isSideDrawerOpen } = useSideDrawer()
   const isSpotlightMode = useIsSpotlightMode()

   const streamIsMobile = useStreamIsMobile()
   const streamIsLandscape = useStreamIsLandscape()
   const narrowIshScreen = useIsMobile(1280)
   const desktopScreen = useIsMobile(1290)

   const galleryIsSquished = narrowIshScreen && isSideDrawerOpen

   return useMemo<Layout>(() => {
      // Single element scenario: straightforward one column, one row.
      if (numberOfElements <= 1) return { columns: 1, rows: 1 }

      // Landscape mode: prioritize a single row, adjusting columns based on count, maxing out at 3.
      if (streamIsLandscape) {
         if (isSpotlightMode) {
            return {
               columns: numberOfElements > 2 ? 2 : 1,
               rows: 2,
            }
         }
         return {
            columns: numberOfElements < 4 ? numberOfElements : 3,
            rows: 1,
         }
      }

      if (isSpotlightMode) {
         return {
            // Max 3 streamers on a single row on mobile
            // Max 4 streamers on a single row on macbook screens
            // Max 6 streamers on a single row on larger than macbook screens
            columns: Math.min(
               streamIsMobile ? 3 : desktopScreen ? 4 : 7,
               numberOfElements
            ),
            rows: 1,
         }
      }

      // Mobile or squished gallery: for two elements, stack them. Otherwise, aim for a 2x2 grid.
      if (streamIsMobile || galleryIsSquished) {
         return numberOfElements === 2
            ? { columns: 1, rows: 2 }
            : { columns: 2, rows: 2 }
      }

      // Small collections (up to 4): Use two columns, adjusting rows based on whether we have 2 or more elements.
      if (numberOfElements <= 4) {
         return { columns: 2, rows: numberOfElements < 3 ? 1 : 2 }
      }

      // Default scenario for larger collections: Opt for a 3x2 grid to balance between rows and columns.
      return { columns: 3, rows: 2 }
   }, [
      desktopScreen,
      galleryIsSquished,
      isSpotlightMode,
      numberOfElements,
      streamIsLandscape,
      streamIsMobile,
   ])
}
