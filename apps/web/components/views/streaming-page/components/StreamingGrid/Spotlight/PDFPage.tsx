import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"

type PageDimensions = {
   width: number
   height: number
}
type Props = {
   presentation: LivestreamPresentation
   parentWidth: number
   parentHeight: number
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
   setPdfNumberOfPages,
}: Props) => {
   pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

   const [originalPageDimensions, setOriginalPageDimensions] =
      useState<PageDimensions>({
         width: 0,
         height: 0,
      })

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

   return (
      <Document
         onLoadSuccess={({ numPages }) => {
            setPdfNumberOfPages(numPages)
         }}
         file={presentation.downloadUrl}
      >
         <Page
            renderTextLayer={false}
            renderAnnotationLayer={false}
            pageNumber={presentation.page}
            onLoadSuccess={({ width, height }) => {
               setOriginalPageDimensions({
                  width,
                  height,
               })
            }}
            scale={0.9}
            /** Page only allows one dimension to be set, so we need to set the other one to undefined */
            width={width}
            height={height}
         />
      </Document>
   )
}
