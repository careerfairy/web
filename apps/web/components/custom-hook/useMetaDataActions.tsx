import React, { FC, useCallback, useEffect, useState } from "react"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import {
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from "@mui/material"
import { CSVLink } from "react-csv"
import PDFIcon from "@mui/icons-material/PictureAsPdf"
import { useAuth } from "../../HOCs/AuthProvider"
import * as actions from "store/actions"
import { useDispatch } from "react-redux"
import { getCSVDelimiterBasedOnOS } from "../../util/CommonUtil"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { PdfReportData } from "@careerfairy/shared-lib/dist/groups/pdf-report"
import { useLivestreamCsvData } from "../useLivestreamCsvData"

interface MetaDataActionsProps {
   group: Group
   isPast: boolean
   isDraft: boolean
   targetStream: LivestreamEvent
}

export function useMetaDataActions({
   group,
   isPast,
   isDraft,
   targetStream,
}: MetaDataActionsProps) {
   const firebase = useFirebaseService()
   const { userData } = useAuth()
   const dispatch = useDispatch()
   const [loadingReportData, setLoadingReportData] = useState<
      Record<string, boolean>
   >({})

   const [reportDataDictionary, setReportDataDictionary] = useState<
      Record<string, PdfReportData>
   >({})
   const [reportPdfData, setReportPdfData] = useState<PdfReportData>(null)

   const canDownloadUsers = Boolean(
      !isDraft && // We can't download users for a draft
         (group.universityCode || // If the group is a university group
            group.privacyPolicyActive || // If the group is not a uni but has their privacy policy active
            userData?.isAdmin) // If the user is a CF admin
   )

   const canDownloadTalentPool = Boolean(!isDraft) // All talent pools can be downloaded regardless of group type

   const { action: talentPoolAction } = useLivestreamCsvData({
      userType: "talentPool",
      canDownload: canDownloadTalentPool,
      targetStream,
   })

   const {
      action: registeredStudentsAction,
      getNumberOfUsers: getNumberOfRegisteredStudents,
   } = useLivestreamCsvData({
      userType: "registered",
      canDownload: canDownloadUsers,
      targetStream,
   })

   const { action: participatedStudentsAction } = useLivestreamCsvData({
      userType: "participated",
      canDownload: canDownloadUsers,
      targetStream,
   })

   const removeReportPdfData = useCallback(() => {
      setReportPdfData(null)
   }, [])

   const handleGetLivestreamReportData = useCallback(
      async (rowData: LivestreamEvent) => {
         try {
            if (!userData.userEmail)
               return dispatch(
                  actions.sendGeneralError("Unable to find user email")
               )

            if (reportDataDictionary[rowData.id]) {
               return setReportPdfData(reportDataDictionary[rowData.id])
            }
            setLoadingReportData((prevState) => ({
               ...prevState,
               [rowData.id]: true,
            }))
            const { data }: { data: PdfReportData } =
               await firebase.getLivestreamReportData({
                  targetStreamId: rowData.id,
                  userEmail: userData.userEmail,
                  targetGroupId: group.id,
               })
            setReportDataDictionary((prevState) => ({
               ...prevState,
               [rowData.id]: data,
            }))
            setReportPdfData(data)
         } catch (e) {
            dispatch(actions.sendGeneralError(e))
         }
         setLoadingReportData((prevState) => ({
            ...prevState,
            [rowData.id]: false,
         }))
      },
      [dispatch, group?.id, userData?.userEmail, reportDataDictionary]
   )

   const pdfReportAction = useCallback(
      (rowData) => {
         const actionLoading = loadingReportData[rowData?.id]
         const reportData = reportDataDictionary[rowData?.id]

         return {
            icon: reportData ? (
               <PDFIcon />
            ) : actionLoading ? (
               <CircularProgress color="inherit" size={15} />
            ) : (
               <PDFIcon color="action" />
            ),
            hintTitle: "Download Report",
            hintDescription:
               "Generate a PDF report giving a concise breakdown of engagement metrics during the event.",
            tooltip: actionLoading
               ? "Downloading Report..."
               : "Download Report",
            onClick: reportData
               ? () => setReportPdfData(reportData)
               : () => handleGetLivestreamReportData(rowData),
            hidden: !isPast || isDraft,
            disabled: actionLoading,
         }
      },
      [isDraft, isPast, loadingReportData, reportDataDictionary, group]
   )

   return {
      talentPoolAction,
      pdfReportAction,
      reportPdfData,
      removeReportPdfData,
      registeredStudentsAction,
      getNumberOfRegisteredStudents,
      participatedStudentsAction,
   }
}

interface CSVDialogDownloadProps {
   title: string
   data: CSVData
   filename: string
   defaultOpen?: boolean
   onClose?: () => void
}

export type CSVData = Record<string, string>[]

export const CSVDialogDownload: FC<
   CSVDialogDownloadProps & {
      children?: React.ReactElement
   }
> = ({
   title,
   children,
   data,
   filename,
   defaultOpen = false,
   onClose = null,
}) => {
   const [open, setOpen] = useState(defaultOpen)

   useEffect(() => {
      setOpen(defaultOpen)
   }, [defaultOpen])

   const handleOpen = useCallback((e) => {
      e.stopPropagation()
      setOpen(true)
   }, [])

   const handleClose = useCallback(
      (e) => {
         e.stopPropagation()
         setOpen(false)
         if (onClose) onClose()
      },
      [onClose]
   )

   const stopClickPropagation = useCallback((e) => {
      e.stopPropagation()
   }, [])

   // try to use right separator at the first try
   const mainSeparator = getCSVDelimiterBasedOnOS()
   const alternativeSeparator = mainSeparator === "," ? ";" : ","

   return (
      <>
         {!!children &&
            // @ts-ignore
            React.cloneElement(children, { onClick: handleOpen })}
         {open && (
            <Dialog open={open} onBackdropClick={handleClose}>
               <DialogTitle onClickCapture={stopClickPropagation}>
                  {title}
               </DialogTitle>
               <DialogContent onClickCapture={stopClickPropagation}>
                  <DialogContentText>
                     You will download a file in the .csv format. This file uses
                     a separator character that can vary with your regional
                     settings.
                  </DialogContentText>
                  <DialogContentText mt={2}>
                     Try the alternative version if having issues opening the
                     downloaded file.
                  </DialogContentText>
               </DialogContent>
               <DialogActions sx={{ justifyContent: "center" }}>
                  <CSVLink
                     data={data}
                     separator={mainSeparator}
                     filename={filename}
                     style={{ color: "red" }}
                     onClick={handleClose}
                  >
                     <Button variant="contained">Download</Button>
                  </CSVLink>

                  <CSVLink
                     data={data}
                     separator={alternativeSeparator}
                     filename={filename}
                     style={{ color: "red" }}
                     onClick={handleClose}
                  >
                     <Button autoFocus>Alternative</Button>
                  </CSVLink>
               </DialogActions>
            </Dialog>
         )}
      </>
   )
}
