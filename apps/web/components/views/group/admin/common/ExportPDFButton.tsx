import React, { FC } from "react"
import LoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import useDialogStateHandler from "../../../../custom-hook/useDialogStateHandler"
import PdfReportDownloadDialog from "../events/PdfReportDownloadDialog"
import usePDFReportData from "../analytics-new/live-stream/search/usePDFReportData"

type ExportPdfButtonProps = LoadingButtonProps & {
   groupId: string
   livestreamId?: string
}
const ExportPdfButton: FC<ExportPdfButtonProps> = ({
   livestreamId,
   groupId,
   ...props
}) => {
   const { errorNotification } = useSnackbarNotifications()

   const [pdfDialogOpen, handleOpenPDFDialog, handleClosePDFDialog] =
      useDialogStateHandler()

   const {
      data: reportData,
      isFetching,
      fetchReportData,
   } = usePDFReportData(groupId, livestreamId, {
      onError: errorNotification,
      onSuccess: () => handleOpenPDFDialog(),
   })

   const handleClose = () => {
      handleClosePDFDialog()
   }

   const handleClick = () => {
      void fetchReportData() // fetch report data on button click
   }

   return (
      <>
         <LoadingButton
            loading={isFetching}
            onClick={handleClick}
            disabled={!livestreamId || !groupId}
            variant="outlined"
            color={"secondary"}
            {...props}
         />
         <PdfReportDownloadDialog
            openDialog={pdfDialogOpen}
            onClose={handleClose}
            reportPdfData={reportData}
         />
      </>
   )
}

export default ExportPdfButton
