import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import { Box, Collapse } from "@mui/material"
import { useDeleteLivestreamPresentation } from "components/custom-hook/streaming/useDeleteLivestreamPresentation"
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
      overflow: "hidden",
   },
})

type Props = {
   livestreamId: string
   pdfPresentation: LivestreamPresentation
}

export const PDFPresentationManager = ({
   livestreamId,
   pdfPresentation,
}: Props) => {
   const [pdfFile, setPdfFile] = useState<File | null>(null)

   const { progress, handleUploadFile } = useUploadPDFPresentation(livestreamId)

   const { trigger: deletePresentation, isMutating } =
      useDeleteLivestreamPresentation(livestreamId)

   const { fileUploaderProps, dragActive } = useFileUploader({
      acceptedFileTypes: ["pdf", "PDF"],
      maxFileSize: 20, // MB
      multiple: false,
      onValidated: async (file) => {
         const newFile = Array.isArray(file) ? file[0] : file
         setPdfFile(newFile)
         handleUploadFile(newFile, livestreamId)
      },
   })

   const handleDeleteFile = () => {
      setPdfFile(null)
      if (pdfPresentation) {
         deletePresentation()
      }
   }

   const hasData = Boolean(pdfPresentation || pdfFile)

   return (
      <Box sx={styles.root}>
         <Collapse unmountOnExit in={hasData}>
            <PDFPreview
               data={pdfPresentation || pdfFile}
               fileUpLoaded={Boolean(progress === 100 && pdfPresentation)}
               uploadProgress={progress}
               isDeleting={isMutating}
               handleDelete={handleDeleteFile}
            />
         </Collapse>
         <Collapse unmountOnExit in={!hasData}>
            <PDFUpload {...fileUploaderProps} dragActive={dragActive} />
         </Collapse>
      </Box>
   )
}
