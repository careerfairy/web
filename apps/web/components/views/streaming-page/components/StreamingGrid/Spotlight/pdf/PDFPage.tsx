import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import { Box } from "@mui/material"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import { useStreamingContext } from "components/views/streaming-page/context"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"
import { PDFLoader } from "./PDFLoader"
import { useDebouncedResize } from "./useDebouncedResize"

// Worker hosted locally to avoid CDN whitelisting issues with corporate clients
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
   "pdfjs-dist/build/pdf.worker.min.js",
   import.meta.url
).toString()

const styles = sxStyles({
   imageContainer: {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
   },
})

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

   // If high-res images are available, use them instead of PDF rendering
   const hasImages = Boolean(presentation?.imageUrls?.length)
   const currentImageUrl = hasImages
      ? presentation.imageUrls[presentation.page - 1]
      : null

   // Set the total number of pages when images are available
   useEffect(() => {
      if (hasImages) {
         setPdfNumberOfPages(presentation.imageUrls!.length)
      }
   }, [hasImages, presentation.imageUrls, setPdfNumberOfPages])

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
      return <PDFLoader parentHeight={parentHeight} aspectRatio={aspectRatio} />
   }

   // If high-res images are available, display the image instead of rendering PDF
   if (currentImageUrl) {
      return (
         <PresentationImage
            imageUrl={currentImageUrl}
            pageNumber={presentation.page}
            livestreamId={livestreamId}
         />
      )
   }

   // Fallback to PDF rendering when images are not yet available
   return (
      <Box component="span">
         <Document
            loading={
               <PDFLoader
                  parentHeight={parentHeight}
                  aspectRatio={aspectRatio}
               />
            }
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
               loading={
                  <PDFLoader
                     parentHeight={parentHeight}
                     aspectRatio={aspectRatio}
                  />
               }
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

type PresentationImageProps = {
   imageUrl: string
   pageNumber: number
   livestreamId: string
}

const PresentationImage = ({
   imageUrl,
   pageNumber,
   livestreamId,
}: PresentationImageProps) => {
   return (
      <Box sx={styles.imageContainer}>
         <Image
            src={imageUrl}
            alt={`Presentation page ${pageNumber}`}
            fill
            quality={100}
            style={{
               objectFit: "contain",
            }}
            priority
            onError={() => {
               errorLogAndNotify(
                  new Error("Failed to load presentation image"),
                  {
                     message: "Image load error",
                     imageUrl,
                     livestreamId,
                     presentationPage: pageNumber,
                  }
               )
            }}
         />
      </Box>
   )
}
