import { useCallback, useMemo, useState } from "react"
import {
   batchPDFDownload,
   DownloadData,
   getAllUsers,
   getCSVDialogData,
   getFileName,
   handleDownloadPDF,
} from "./util"
import useSnackbarNotifications from "../../../../../custom-hook/useSnackbarNotifications"
import { useCopyToClipboard } from "react-use"
import { UserDataEntry } from "./UserLivestreamDataTable"
import { Query } from "@firebase/firestore"

export const useDownloadCV = (user: UserDataEntry) => {
   const { errorNotification } = useSnackbarNotifications()
   const [downloadingPDF, setDownloadingPDF] = useState(false)

   const handleDownloadCV = useCallback(async () => {
      try {
         setDownloadingPDF(true)
         await handleDownloadPDF(user.resumeUrl, getFileName(user))
      } catch (e) {
         errorNotification(e, "Error downloading CV")
      } finally {
         setDownloadingPDF(false)
      }
   }, [errorNotification, user])

   return useMemo(
      () => ({
         handleDownloadCV,
         downloadingPDF,
      }),
      [downloadingPDF, handleDownloadCV]
   )
}

export const useDownloadAllCVs = (
   fullQuery: Query,
   converterFn: (unknown) => UserDataEntry,
   title: string
) => {
   const { errorNotification } = useSnackbarNotifications()
   const [downloadingAllCVs, setDownloadingAllCVs] = useState(false)

   const handleDownloadAllCVs = useCallback(async () => {
      try {
         setDownloadingAllCVs(true)
         const users = await getAllUsers(fullQuery, converterFn)
         const downloadData = users
            .filter((user) => user.resumeUrl)
            .map<DownloadData>((user) => ({
               url: user.resumeUrl,
               fileName: getFileName(user),
            }))

         await batchPDFDownload(downloadData, `${title} CVs`)
      } catch (e) {
         errorNotification(e, "Error downloading CVs")
      } finally {
         setDownloadingAllCVs(false)
      }
   }, [converterFn, errorNotification, fullQuery, title])

   return useMemo(
      () => ({
         handleDownloadAllCVs,
         downloadingAllCVs,
      }),
      [downloadingAllCVs, handleDownloadAllCVs]
   )
}

export const useExportUsers = (
   fullQuery: Query,
   converterFn: (unknown) => UserDataEntry,
   title: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const [csvDownloadData, setCsvDownloadData] = useState(null)
   const [exportingUsers, setExportingUsers] = useState(false)

   const handleCloseCsvDialog = useCallback(() => {
      setCsvDownloadData(null)
   }, [])

   const handleExportUsers = useCallback(async () => {
      try {
         setExportingUsers(true)

         const users = await getAllUsers(fullQuery, converterFn)
         const csvDialogData = getCSVDialogData(users, title)

         setCsvDownloadData(csvDialogData)
      } catch (e) {
         errorNotification(e, "Error exporting users")
      } finally {
         setExportingUsers(false)
      }
   }, [converterFn, errorNotification, fullQuery, title])

   return useMemo(
      () => ({
         csvDownloadData,
         handleCloseCsvDialog,
         handleExportUsers,
         exportingUsers,
      }),
      [csvDownloadData, handleCloseCsvDialog, handleExportUsers, exportingUsers]
   )
}

export const useCopyAllEmails = (
   fullQuery: Query,
   converterFn: (unknown) => UserDataEntry
) => {
   const [copyingEmails, setCopyingEmails] = useState(false)
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const [_, copyToClipboard] = useCopyToClipboard()

   const handleCopyAllEmails = useCallback(async () => {
      try {
         setCopyingEmails(true)

         const users = await getAllUsers(fullQuery, converterFn)

         const emailAddresses = users
            .filter((data) => data.email)
            .map((data) => data.email)
            .join(";")
         copyToClipboard(emailAddresses)

         successNotification("Email addresses have been copied!")
      } catch (e) {
         errorNotification(e, "Error copying emails")
      } finally {
         setCopyingEmails(false)
      }
   }, [
      converterFn,
      errorNotification,
      fullQuery,
      copyToClipboard,
      successNotification,
   ])

   return useMemo(
      () => ({
         handleCopyAllEmails,
         copyingEmails,
      }),
      [copyingEmails, handleCopyAllEmails]
   )
}
