import { useCallback, useMemo, useState } from "react"
import { getFileName, handleDownloadPDF } from "./util"
import useSnackbarNotifications from "../../../../../custom-hook/useSnackbarNotifications"
import { useCopyToClipboard } from "react-use"
import { UserDataEntry } from "./UserLivestreamDataTable"

export const useDownloadCV = (user: UserDataEntry) => {
   const { errorNotification } = useSnackbarNotifications()
   const [downloading, setDownloading] = useState(false)

   const handleDownloadCV = useCallback(async () => {
      try {
         setDownloading(true)
         await handleDownloadPDF(user.resumeUrl, getFileName(user))
      } catch (e) {
         errorNotification(e, "Error downloading CV")
      } finally {
         setDownloading(false)
      }
   }, [errorNotification, user])

   return useMemo(
      () => ({
         handleDownloadCV,
         downloading,
      }),
      [downloading, handleDownloadCV]
   )
}

export const useCopyEmails = (users: UserDataEntry[]) => {
   const { successNotification } = useSnackbarNotifications()
   const [_, copyToClipboard] = useCopyToClipboard()

   return useCallback(() => {
      const emailAddresses = users
         .filter((data) => data.email)
         .map((data) => data.email)
         .join(",")
      copyToClipboard(emailAddresses)
      successNotification("Email addresses have been copied!")
   }, [copyToClipboard, successNotification, users])
}
