import { useCallback, useMemo, useState } from "react"
import { UserData } from "@careerfairy/shared-lib/users"
import { getFileName, handleDownloadPDF } from "./util"
import useSnackbarNotifications from "../../../../../custom-hook/useSnackbarNotifications"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { useCopyToClipboard } from "react-use"

export const useDownloadCV = (user: UserData) => {
   const { errorNotification } = useSnackbarNotifications()
   const [downloading, setDownloading] = useState(false)

   const handleDownloadCV = useCallback(async () => {
      try {
         setDownloading(true)
         await handleDownloadPDF(user.userResume, getFileName(user))
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

export const useCopyEmails = (users: UserLivestreamData[]) => {
   const { successNotification } = useSnackbarNotifications()
   const [_, copyToClipboard] = useCopyToClipboard()

   return useCallback(() => {
      const emailAddresses = users
         .filter((data) => data.user.id)
         .map((data) => data.user.id)
         .join(",")
      copyToClipboard(emailAddresses)
      successNotification("LinkedIn addresses have been copied!")
   }, [copyToClipboard, successNotification, users])
}
