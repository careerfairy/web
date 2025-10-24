import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import { Box, CircularProgress } from "@mui/material"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import { useStreamingContext } from "components/views/streaming-page/context"
import { useEffect, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { errorLogAndNotify } from "util/CommonUtil"
import { useDebouncedResize } from "./useDebouncedResize"

// Worker hosted locally to avoid CDN whitelisting issues with corporate clients
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
   "pdfjs-dist/build/pdf.worker.min.js",
   import.meta.url
).toString()

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

   const { agoraUserId, isHost } = useStreamingContext()
   const { data: streamerDetails } = useStreamerDetails(agoraUserId)

   const [originalPageDimensions, setOriginalPageDimensions] =
      useState<PageDimensions>({
         width: 0,
         height: 0,
      })

   // // Check for service worker support to detect corporate clients with strict security policies
   useEffect(() => {
      if (isHost && !("serviceWorker" in navigator)) {
         errorLogAndNotify(new Error("Service Worker not supported"), {
            message:
               "Host device does not support Service Workers - may impact PDF rendering",
            livestreamId,
            streamerDetails,
         })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isHost, livestreamId])

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
               renderAnnotationLayer={false}
               renderTextLayer={false}
               pageNumber={presentation.page}
               onLoadSuccess={setOriginalPageDimensions}
               onLoadError={handleLoadError}
               onRenderError={handleRenderError}
               /** Page only allows one dimension to be set, so we need to set the other one to undefined */
               width={width}
               height={height}
               // Greatly improve text rendering quality by increasing the device pixel ratio to 4x
               devicePixelRatio={window.devicePixelRatio * 4}
            />
         </Document>
      </Box>
   )
}
