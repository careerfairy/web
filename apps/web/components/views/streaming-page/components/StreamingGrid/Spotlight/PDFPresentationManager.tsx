import { Box, CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamPDFPresentation } from "components/custom-hook/streaming/useLivestreamPDFPresentation"
import useFileUploader from "components/custom-hook/useFileUploader"
import useFirebaseUpload from "components/custom-hook/useFirebaseUpload"
import { livestreamService } from "data/firebase/LivestreamService"
import { useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify, sanitizeFileName } from "util/CommonUtil"
import { PDFPreview } from "./PDFPreview"
import { PDFUpload } from "./PDFUpload"

const styles = sxStyles({
   root: {
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.purple[100]}`,
      bgcolor: (theme) => theme.brand.white[300],
   },
})

type Props = {
   livestreamId: string
}

export const PDFPresentationManager = (props: Props) => {
   return (
      <Box sx={styles.root}>
         <SuspenseWithBoundary fallback={<CircularProgress />}>
            <Content {...props} />
         </SuspenseWithBoundary>
      </Box>
   )
}

export const Content = ({ livestreamId }: Props) => {
   const { data: pdfPresentation } = useLivestreamPDFPresentation(livestreamId)

   const [pdfFile, setPdfFile] = useState<File | null>(null)

   const [uploadFile, uploadProgress, , , , cancelUpload] = useFirebaseUpload(
      (error) =>
         errorLogAndNotify(error, {
            message: "Failed to upload PDF presentation",
            title: "Upload PDF presentation failed",
         })
   )

   // Cancel upload on unmount if there is one
   useEffect(() => {
      return () => {
         cancelUpload()
      }
   }, [cancelUpload])

   const { fileUploaderProps, dragActive } = useFileUploader({
      acceptedFileTypes: ["pdf", "PDF"],
      maxFileSize: 20, // MB
      multiple: false,
      onValidated: async (file) => {
         const newFile = Array.isArray(file) ? file[0] : file
         console.log("🚀 ~ Set PDF file")
         setPdfFile(newFile)

         const sanitizedFileName = sanitizeFileName(newFile.name)

         console.log("🚀 ~ Upload PDF presentation")
         const url = await uploadFile(
            newFile,
            `live-stream-media/${livestreamId}/${sanitizedFileName}`
         )

         console.log("🚀 ~ Set PDF presentation")
         await livestreamService.setLivestreamPDFPresentation(
            livestreamId,
            url,
            newFile
         )

         console.log("🚀 ~ Clear PDF file")
         setPdfFile(null)
      },
   })

   if (pdfPresentation || pdfFile) {
      return (
         <PDFPreview
            data={pdfPresentation || pdfFile}
            uploadProgress={uploadProgress}
         />
      )
   }

   return <PDFUpload {...fileUploaderProps} dragActive={dragActive} />
}
