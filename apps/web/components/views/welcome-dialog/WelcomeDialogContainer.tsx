import { useEffect, useMemo } from "react"
import { isLivestreamDialogOpen } from "../livestream-dialog"
import { useRouter } from "next/router"
import useDialogStateHandler from "../../custom-hook/useDialogStateHandler"
import { useAuth } from "../../../HOCs/AuthProvider"
import { userRepo } from "../../../data/RepositoryInstances"
import { errorLogAndNotify } from "../../../util/CommonUtil"
import WelcomeDialog from "./WelcomeDialog"

/**
 * Logic for displaying the welcome dialog
 */
export const WelcomeDialogContainer = () => {
   const { isLoadingUserData, userPresenter } = useAuth()
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const { query } = useRouter()

   const isLivestreamDialogOpenAlready = useMemo(() => {
      return isLivestreamDialogOpen(query)
   }, [query])

   useEffect(() => {
      if (isLoadingUserData || !userPresenter) {
         // we need the user data
         return
      }

      if (!userPresenter.shouldSeeWelcomeDialog()) {
         // already displayed the welcome dialog or it's an old user
         return
      }

      if (isLivestreamDialogOpenAlready) {
         // don't show the welcome dialog if the livestream dialog is open
         return
      }

      if (!isDialogOpen) {
         handleOpenDialog()
         userRepo
            .welcomeDialogComplete(userPresenter.get("userEmail"))
            .catch(errorLogAndNotify)
      }
   }, [
      handleOpenDialog,
      isDialogOpen,
      isLivestreamDialogOpenAlready,
      isLoadingUserData,
      userPresenter,
   ])

   if (isDialogOpen) {
      return (
         <WelcomeDialog open={isDialogOpen} handleClose={handleCloseDialog} />
      )
   }

   return null
}
