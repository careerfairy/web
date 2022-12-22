import { Button } from "@mui/material"
import { useCallback, useState } from "react"
import AreYouSureModal from "../../../../../materialUI/GlobalModals/AreYouSureModal"
import { atsServiceInstance } from "../../../../../data/firebase/ATSService"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { useMountedState } from "react-use"
import { useATSAccount } from "./ATSAccountContextProvider"

const RemoveLinkedAccountButton = () => {
   const { atsAccount } = useATSAccount()
   const [isOpen, setOpen] = useState(false)
   const [isLoading, setIsLoading] = useState(false)
   const isMounted = useMountedState()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const onClose = useCallback(() => {
      setOpen(false)
   }, [])

   const openDialog = useCallback(() => {
      setOpen(true)
   }, [])

   const handleConfirm = useCallback(() => {
      setIsLoading(true)
      atsServiceInstance
         .removeAccount(atsAccount.groupId, atsAccount.id)
         .then((_) => {
            successNotification("Account removed with success")
         })
         .catch((e) => {
            errorNotification(
               e,
               "Failed to remove linked account, try again later"
            )
         })
         .finally(() => {
            // avoid updating state when the parent component already un-mounted this component
            // the parent component has a realtime listener and will unmount this component after
            // deleting the docs
            if (isMounted) {
               setIsLoading(false)
               onClose()
            }
         })
   }, [
      atsAccount.id,
      atsAccount.groupId,
      successNotification,
      errorNotification,
      onClose,
      isMounted,
   ])

   return (
      <>
         <Button
            variant={"contained"}
            onClick={openDialog}
            size={"small"}
            color={"error"}
         >
            Unlink
         </Button>
         {isOpen && (
            <AreYouSureModal
               open={isOpen}
               handleClose={onClose}
               loading={isLoading}
               title={`Are you sure you want to remove ${atsAccount.name} account?`}
               handleConfirm={handleConfirm}
               message={
                  "The data will be deleted from our systems, you can add this integration later in the future again."
               }
            />
         )}
      </>
   )
}

export default RemoveLinkedAccountButton
