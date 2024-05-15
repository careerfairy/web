import { Box, CircularProgress, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import {
   useSideDrawer,
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { useLivestreamPDFPresentation } from "components/custom-hook/streaming/useLivestreamPDFPresentation"
import { useStreamingContext } from "components/views/streaming-page/context"
import { useState } from "react"
import { useMeasure } from "react-use"
import { sxStyles } from "types/commonTypes"
import { PDFNavigation } from "./PDFNavigation"
import { PDFPage } from "./PDFPage"
import { UploadNewPDFButton } from "./UploadNewPDFButton"

const styles = sxStyles({
   root: {
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "12px",
      overflow: "hidden",
      backgroundColor: (theme) => theme.brand.white[500],
      position: "relative",
   },
})

export const SpotlightPDF = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content />
      </SuspenseWithBoundary>
   )
}
export const Content = () => {
   const { livestreamId, isHost } = useStreamingContext()
   const { data: pdfPresentation } = useLivestreamPDFPresentation(livestreamId)
   const [ref, { width, height }] = useMeasure()

   const streamIsLandscape = useStreamIsLandscape()
   const isMobile = useStreamIsMobile()
   const { isOpen } = useSideDrawer()

   /**
    * This key is used to reset the canvas when significant changes in responsiveness occur,
    * which helps in avoiding annoying flickering effects.
    */
   const pdfKey = `landscape-${streamIsLandscape}-mobile-${isMobile}-drawer-${isOpen}`

   const [pdfNumberOfPages, setPdfNumberOfPages] = useState(0)

   if (!pdfPresentation) {
      return (
         <Box sx={styles.root}>
            <Typography
               variant="desktopBrandedH4"
               fontWeight={700}
               textAlign="center"
            >
               Please wait for the host to load the presentation
            </Typography>
         </Box>
      )
   }

   return (
      <Box ref={ref} sx={styles.root}>
         <PDFPage
            key={pdfKey}
            presentation={pdfPresentation}
            parentWidth={width}
            livestreamId={livestreamId}
            parentHeight={height}
            setPdfNumberOfPages={setPdfNumberOfPages}
         />
         {Boolean(isHost) && (
            <PDFNavigation
               page={pdfPresentation.page}
               totalPages={pdfNumberOfPages}
            />
         )}
         {Boolean(isHost) && <UploadNewPDFButton />}
      </Box>
   )
}

const Loader = () => {
   return (
      <Box sx={styles.root}>
         <CircularProgress />
      </Box>
   )
}
