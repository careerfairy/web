import {
   useSideDrawer,
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useCallback, useMemo } from "react"

type UseGalleryLayout<ElementType> = {
   /** The layout of the gallery, specifying the number of columns and rows */
   layout: { columns: number; rows: number }
   /** An array of gallery pages, each containing an array of elements */
   galleryPages: Array<Array<ElementType>>
   /** The total number of pages/views in the gallery */
   numOfPages: number
}

/**
 * Custom hook to calculate the layout for a gallery based on the number of elements, screen size, and whether a side panel is open.
 * It dynamically adjusts the number of columns and rows for the gallery, and organizes elements into pages.
 *
 * @param  elements - An array of elements to be rendered in the gallery.
 * @returns {GalleryLayout} - An object containing the number of streamers, a setter function for the number of streamers, the calculated layout, the paginated gallery pages, and the total number of pages.
 */
const useGalleryLayout = <ElementType>(
   elements: ElementType[]
): UseGalleryLayout<ElementType> => {
   const { isOpen: isSideDrawerOpen } = useSideDrawer()

   const streamIsMobile = useStreamIsMobile()
   const streamIsLandscape = useStreamIsLandscape()
   const narrowIshScreen = useIsMobile(1280)

   const galleryIsSquished = narrowIshScreen && isSideDrawerOpen

   const getLayout = useCallback(
      (count: number) => {
         // Single element scenario: straightforward one column, one row.
         if (count === 1) return { columns: 1, rows: 1 }

         // Landscape mode: prioritize a single row, adjusting columns based on count, maxing out at 3.
         if (streamIsLandscape) {
            return { columns: count < 4 ? count : 3, rows: 1 }
         }

         // Mobile or squished gallery: for two elements, stack them. Otherwise, aim for a 2x2 grid.
         if (streamIsMobile || galleryIsSquished) {
            return count === 2
               ? { columns: 1, rows: 2 }
               : { columns: 2, rows: 2 }
         }

         // Small collections (up to 4): Use two columns, adjusting rows based on whether we have 2 or more elements.
         if (count <= 4) {
            return { columns: 2, rows: count < 3 ? 1 : 2 }
         }

         // Default scenario for larger collections: Opt for a 3x2 grid to balance between rows and columns.
         return { columns: 3, rows: 2 }
      },
      [streamIsMobile, streamIsLandscape, galleryIsSquished]
   )

   const layout = useMemo(
      () => getLayout(elements.length),
      [elements.length, getLayout]
   )

   const itemsPerPage = layout.columns * layout.rows
   const numOfPages = Math.ceil(elements.length / itemsPerPage)

   const galleryPages = useMemo(
      () =>
         Array.from({ length: numOfPages }, (_, pageIndex) => {
            const start = pageIndex * itemsPerPage
            return elements.slice(start, start + itemsPerPage)
         }),
      [elements, itemsPerPage, numOfPages]
   )

   return { layout, galleryPages, numOfPages }
}

export default useGalleryLayout
