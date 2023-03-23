import React from "react"
import { LoadingButton } from "@mui/lab"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { useLivestreamsAnalyticsPageContext } from "../LivestreamAnalyticsPageProvider"
import useSnackbarNotifications from "../../../../../../custom-hook/useSnackbarNotifications"
import useDialogStateHandler from "../../../../../../custom-hook/useDialogStateHandler"
import PdfReportDownloadDialog from "../../../events/PdfReportDownloadDialog"
import usePDFReportData from "./usePDFReportData"

const ExportPdfButton = () => {
   const { group } = useGroup()
   const { errorNotification } = useSnackbarNotifications()
   const { currentStreamStats } = useLivestreamsAnalyticsPageContext()

   const [pdfDialogOpen, handleOpenPDFDialog, handleClosePDFDialog] =
      useDialogStateHandler()

   const {
      data: reportData,
      isMutating,
      trigger,
   } = usePDFReportData(group.id, currentStreamStats?.livestream?.id, {
      onError: errorNotification,
      onSuccess: () => handleOpenPDFDialog(),
   })

   const handleClose = () => {
      handleClosePDFDialog()
   }

   const handleClick = () => {
      if (reportData) {
         handleOpenPDFDialog()
      } else {
         void trigger()
      }
   }

   return (
      <>
         <LoadingButton
            loading={isMutating}
            onClick={handleClick}
            disabled={!currentStreamStats}
            variant="outlined"
            color={"secondary"}
         >
            Export PDF
         </LoadingButton>
         <PdfReportDownloadDialog
            openDialog={pdfDialogOpen}
            onClose={handleClose}
            reportPdfData={reportData}
         />
      </>
   )
}

export default ExportPdfButton
