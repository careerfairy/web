import { Box, CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamPDFPresentation } from "components/custom-hook/streaming/useLivestreamPDFPresentation"
import useUploadPDFPresentation from "components/custom-hook/streaming/useUploadPDFPresentation"
import useFileUploader from "components/custom-hook/useFileUploader"
import { useState } from "react"
import { sxStyles } from "types/commonTypes"
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

   const { progress, handleUploadFile } = useUploadPDFPresentation(livestreamId)

   const { fileUploaderProps, dragActive } = useFileUploader({
      acceptedFileTypes: ["pdf", "PDF"],
      maxFileSize: 20, // MB
      multiple: false,
      onValidated: async (file) => {
         const newFile = Array.isArray(file) ? file[0] : file
         setPdfFile(newFile)
         handleUploadFile(newFile, true)
      },
   })

   if (pdfPresentation || pdfFile) {
      return (
         <PDFPreview
            data={pdfPresentation || pdfFile}
            fileUpLoaded={Boolean(progress === 100 && pdfPresentation)}
            uploadProgress={progress}
         />
      )
   }

   return <PDFUpload {...fileUploaderProps} dragActive={dragActive} />
}
