import { RefObject, useEffect, useState } from "react"

const REAL_DIALOG_WIDTH = 715
const PREVIEW_COLUMN_PADDING_X = 56
const PREVIEW_COLUMN_WIDTH_PERCENTAGE = ["41%", 0.41] as const

const useOfflineEventPreviewScale = (containerRef: RefObject<HTMLElement>) => {
   const [scale, setScale] = useState(1)
   const [previewWidth, setPreviewWidth] = useState<string | null>(null)

   useEffect(() => {
      const updateScale = () => {
         if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth
            const previewWidthInViewport =
               containerWidth * PREVIEW_COLUMN_WIDTH_PERCENTAGE[1]
            const newScale =
               previewWidthInViewport >= REAL_DIALOG_WIDTH
                  ? 1
                  : (previewWidthInViewport - PREVIEW_COLUMN_PADDING_X * 2) /
                    REAL_DIALOG_WIDTH

            const previewWidth =
               newScale === 1
                  ? REAL_DIALOG_WIDTH + PREVIEW_COLUMN_PADDING_X * 2 + "px"
                  : PREVIEW_COLUMN_WIDTH_PERCENTAGE[0]

            setScale(newScale)
            setPreviewWidth(previewWidth)
         }
      }

      updateScale()
      window.addEventListener("resize", updateScale)

      return () => {
         window.removeEventListener("resize", updateScale)
      }
   }, [containerRef, scale])

   return { scale, previewWidth }
}

export default useOfflineEventPreviewScale
