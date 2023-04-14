import React, { memo } from "react"
import {
   Box,
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   IconButton,
   Slide,
} from "@mui/material"
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import EventPdfReport from "./EventPdfReport"
import { useTheme } from "@mui/material/styles"
import CloseIcon from "@mui/icons-material/Close"
import { isMobile } from "react-device-detect"
import { Alert, AlertTitle } from "@mui/material"
import { PdfReportData } from "@careerfairy/shared-lib/groups/pdf-report"

interface DialogContentProps {
   handleClose: () => void
   reportPdfData: PdfReportData
}
const PdfReportDownloadDialogContent = ({
   handleClose,
   reportPdfData,
}: DialogContentProps) => {
   const theme = useTheme()

   if (isMobile) {
      return (
         <>
            <DialogContent>
               <DialogContentText>Download your PDF </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleClose}>Close</Button>
               <PDFDownloadLink
                  style={{
                     width: "100%",
                  }}
                  fileName={`General Report ${reportPdfData.summary.livestream.title} ${reportPdfData.summary.livestream.id}.pdf`}
                  document={<EventPdfReport {...reportPdfData} />}
               >
                  {({ loading, error }) =>
                     error ? (
                        <Alert severity="error">
                           <AlertTitle>{error}</AlertTitle>
                           Something went wrong —{" "}
                           <a
                              color="inherit"
                              href="mailto:thomas@careerfairy.io"
                           >
                              <strong>
                                 Get in touch with the CareerFairy Team
                              </strong>
                           </a>
                        </Alert>
                     ) : (
                        <Button
                           fullWidth
                           disabled={loading}
                           variant="contained"
                           color="primary"
                        >
                           {loading ? (
                              <CircularProgress />
                           ) : (
                              "Tap Here to download the pdf"
                           )}
                        </Button>
                     )
                  }
               </PDFDownloadLink>
            </DialogActions>
         </>
      )
   }
   return (
      <React.Fragment>
         <Box display="flex" justifyContent="flex-end" color="white">
            <IconButton color="inherit" onClick={handleClose} size="large">
               <CloseIcon fontSize="large" />
            </IconButton>
         </Box>
         <PDFViewer
            style={{
               width: "100%",
               height: "80vh",
               border: "none",
               borderRadius: theme.spacing(0.4),
            }}
         >
            <EventPdfReport {...reportPdfData} />
         </PDFViewer>
      </React.Fragment>
   )
}

interface DownloadDialogProps {
   openDialog: boolean
   onClose: () => void
   reportPdfData: PdfReportData
}
const PdfReportDownloadDialog = ({
   openDialog,
   onClose,
   reportPdfData,
}: DownloadDialogProps) => {
   const handleClose = () => {
      onClose?.()
   }

   return (
      <Dialog
         open={openDialog}
         onClose={handleClose}
         TransitionComponent={Slide}
         scroll={"paper"}
         maxWidth={isMobile ? "xs" : "lg"}
         fullWidth
         PaperProps={{
            style: {
               background: !isMobile && "none",
               boxShadow: !isMobile && "none",
            },
         }}
         aria-labelledby="pdf-report-download-dialog"
      >
         {reportPdfData && (
            <PdfReportDownloadDialogContent
               handleClose={handleClose}
               reportPdfData={reportPdfData}
            />
         )}
      </Dialog>
   )
}

export default memo(PdfReportDownloadDialog)
