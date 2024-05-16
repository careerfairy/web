import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import { Box, CircularProgress } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { errorLogAndNotify } from "util/CommonUtil"

// Worker needs to ba added as per docs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

type PageDimensions = {
   width: number
   height: number
}
type Props = {
   presentation: LivestreamPresentation
   parentWidth: number
   parentHeight: number
   livestreamId: string
   setPdfNumberOfPages: (numPages: number) => void
}

const calculateAdjustedDimensions = (
   maxWidth: number,
   maxHeight: number,
   aspectRatio: number
): PageDimensions => {
   let adjustedWidth = maxWidth
   let adjustedHeight = adjustedWidth / aspectRatio

   if (adjustedHeight > maxHeight) {
      adjustedHeight = maxHeight
      adjustedWidth = adjustedHeight * aspectRatio
   }

   return { width: adjustedWidth, height: adjustedHeight }
}

export const PDFPage = ({
   presentation,
   parentWidth,
   parentHeight,
   livestreamId,
   setPdfNumberOfPages,
}: Props) => {
   const isReady = useDebouncedResize(parentWidth, parentHeight)

   const [originalPageDimensions, setOriginalPageDimensions] =
      useState<PageDimensions>({
         width: 0,
         height: 0,
      })

   const handleRenderError = (e: Error) => {
      errorLogAndNotify(e, {
         message: "Failed to render PDF",
         presentationUrl: presentation.downloadUrl,
         presentationPage: presentation.page,
         livestreamId,
      })
   }

   const handleLoadError = (e: Error) => {
      errorLogAndNotify(e, {
         message: "Failed to load PDF",
         presentationUrl: presentation.downloadUrl,
         presentationPage: presentation.page,
         livestreamId,
      })
   }

   const aspectRatio =
      originalPageDimensions.width / originalPageDimensions.height

   const adjustedDimensions = calculateAdjustedDimensions(
      parentWidth,
      parentHeight,
      aspectRatio
   )

   const maxAspectRatio = parentWidth / parentHeight

   let width: number | undefined, height: number | undefined
   if (aspectRatio > maxAspectRatio) {
      // PDF is wider than the container
      width = adjustedDimensions.width
      height = undefined // Let height auto-adjust
   } else {
      // PDF is taller than the container
      width = undefined // Let width auto-adjust
      height = adjustedDimensions.height
   }

   if (!isReady) {
      return <CircularProgress />
   }

   return (
      <Box component="span">
         <Document
            loading={<CircularProgress />}
            onLoadSuccess={({ numPages }) => {
               setPdfNumberOfPages(numPages)
            }}
            file={presentation.downloadUrl}
            onLoadError={handleLoadError}
         >
            <Page
               renderTextLayer={false}
               renderAnnotationLayer={false}
               pageNumber={presentation.page}
               onLoadSuccess={setOriginalPageDimensions}
               onLoadError={handleLoadError}
               onRenderError={handleRenderError}
               /** Page only allows one dimension to be set, so we need to set the other one to undefined */
               width={width}
               height={height}
            />
         </Document>
      </Box>
   )
}

/**
 * A hook that delays rendering until after window resizing has stabilized.
 *
 * @param {number} width - Current width of the container.
 * @param {number} height - Current height of the container.
 * @param {number} [delay=250] - Milliseconds to wait after resizing before confirming stabilization.
 * @returns {boolean} - True if resizing has stabilized, allowing rendering to proceed.
 */
const useDebouncedResize = (
   width: number,
   height: number,
   delay: number = 250
) => {
   const [isReady, setIsReady] = useState(false)
   const resizeTimer = useRef<NodeJS.Timeout | null>(null)

   useEffect(() => {
      setIsReady(false) // Reset ready state on size change
      if (resizeTimer.current) {
         clearTimeout(resizeTimer.current)
      }
      resizeTimer.current = setTimeout(() => {
         setIsReady(true)
      }, delay) // Wait for delay ms of no size changes

      return () => {
         if (resizeTimer.current) {
            clearTimeout(resizeTimer.current)
         }
      }
   }, [width, height, delay])

   return isReady
}
