import { RefObject, useEffect, useState } from "react"
import {
   PREVIEW_COLUMN_PADDING_X,
   PREVIEW_COLUMN_WIDTH_PERCENTAGE,
   REAL_DIALOG_WIDTH,
} from "./commons"

const usePreviewScale = (containerRef: RefObject<HTMLElement>) => {
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

export default usePreviewScale
