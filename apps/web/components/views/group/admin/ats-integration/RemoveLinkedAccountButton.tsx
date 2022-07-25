import { Button } from "@mui/material"
import { useCallback, useState } from "react"
import AreYouSureModal from "../../../../../materialUI/GlobalModals/AreYouSureModal"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"
import { atsServiceInstance } from "../../../../../data/firebase/ATSService"

type Props = {
   atsAccount: GroupATSAccount
}

const RemoveLinkedAccountButton = ({ atsAccount }: Props) => {
   const [isOpen, setOpen] = useState(false)
   const [isLoading, setIsLoading] = useState(false)

   const onClose = useCallback(() => {
      setOpen(false)
   }, [])

   const openDialog = useCallback(() => {
      setOpen(true)
   }, [])

   const handleConfirm = useCallback(() => {
      console.log("confirm!")
      // atsServiceInstance.removeAccount(atsAccount.groupId, atsAccount.id).then()
   }, [atsAccount.id, atsAccount.groupId])

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
         <AreYouSureModal
            open={isOpen}
            handleClose={onClose}
            loading={isLoading}
            title="Are you sure?"
            handleConfirm={handleConfirm}
            message={"My Message"}
         />
      </>
   )
}

export default RemoveLinkedAccountButton
