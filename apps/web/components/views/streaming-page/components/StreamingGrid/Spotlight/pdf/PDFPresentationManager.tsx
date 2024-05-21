import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import { Box } from "@mui/material"
import { useDeleteLivestreamPresentation } from "components/custom-hook/streaming/useDeleteLivestreamPresentation"
import useUploadPDFPresentation from "components/custom-hook/streaming/useUploadPDFPresentation"
import useFileUploader from "components/custom-hook/useFileUploader"
import { Dispatch, SetStateAction, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { PDFProgress } from "./PDFDetails"
import { PDFUpload } from "./PDFUpload"

const styles = sxStyles({
   root: {
      mb: 4,
   },
})

type Props = {
   livestreamId: string
   pdfPresentation: LivestreamPresentation
   readyToShare: boolean
   setReadyToShare: Dispatch<SetStateAction<boolean>>
}

export const PDFPresentationManager = ({
   livestreamId,
   pdfPresentation,
   readyToShare,
   setReadyToShare,
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
         await handleUploadFile(newFile, livestreamId)

         setReadyToShare(true)
      },
   })

   const handleDeleteFile = () => {
      setPdfFile(null)
      if (pdfPresentation) {
         deletePresentation()
      }
   }

   return (
      <Box sx={styles.root}>
         {pdfFile ? (
            <PDFProgress
               data={pdfPresentation || pdfFile}
               fileUpLoaded={Boolean(progress === 100 && pdfPresentation)}
               uploadProgress={progress}
               isDeleting={isMutating}
               handleDelete={handleDeleteFile}
            />
         ) : (
            <PDFUpload
               dragActive={dragActive}
               readyToShare={readyToShare}
               pdfPresentation={pdfPresentation}
               setReadyToShare={setReadyToShare}
               {...fileUploaderProps}
            />
         )}
      </Box>
   )
}
