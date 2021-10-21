import PropTypes from "prop-types";
import React, { memo } from "react";
import { Dialog, Slide } from "@material-ui/core";
import { PDFViewer } from "@react-pdf/renderer";
import EventPdfReport from "./EventPdfReport";
import { useTheme } from "@material-ui/core/styles";

const PdfReportDownloadDialogContent = ({ handleClose, reportPdfData }) => {
   const theme = useTheme();
   return (
      <React.Fragment>
         <PDFViewer
            style={{
               width: "100%",
               height: "clamp(150px, 80vh, 80vh)",
               border: "none",
               borderRadius: theme.spacing(0.4),
            }}
         >
            <EventPdfReport {...reportPdfData} />
         </PDFViewer>
      </React.Fragment>
   );
};

PdfReportDownloadDialogContent.propTypes = {
   handleClose: PropTypes.func,
};

const PdfReportDownloadDialog = ({ openDialog, onClose, reportPdfData }) => {
   const handleClose = () => {
      onClose?.();
   };
   return (
      <Dialog
         open={openDialog}
         onClose={handleClose}
         TransitionComponent={Slide}
         scroll={"paper"}
         maxWidth={"lg"}
         fullWidth
         aria-labelledby="pdf-report-download-dialog"
      >
         {reportPdfData && (
            <PdfReportDownloadDialogContent
               handleClose={handleClose}
               reportPdfData={reportPdfData}
            />
         )}
      </Dialog>
   );
};

PdfReportDownloadDialog.propTypes = {
   onClose: PropTypes.func,
   openDialog: PropTypes.bool,
   reportPdfData: PropTypes.shape({
      summary: PropTypes.object,
      groupReports: PropTypes.array,
   }),
};

export default memo(PdfReportDownloadDialog);
