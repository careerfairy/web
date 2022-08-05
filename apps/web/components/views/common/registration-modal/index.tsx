import React, { memo } from "react"
import { Dialog, Grow } from "@mui/material"
import { RegistrationContextProvider } from "context/registration/RegistrationContext"
import RegistrationForm from "./RegistrationForm"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

const RegistrationModal = memo(
   ({
      open = false,
      handleClose,
      livestream,
      groups,
      promptOtherEventsOnFinal,
      onGroupJoin,
      onFinish,
      targetGroupId,
   }: Props) => {
      const cancelable = Boolean(handleClose)
      const onClose = () => {
         handleClose?.()
      }

      return (
         <Dialog
            maxWidth="md"
            scroll="paper"
            fullWidth
            TransitionComponent={Grow}
            open={open}
            onClose={cancelable ? onClose : undefined}
         >
            <RegistrationContextProvider
               closeModal={onClose}
               livestream={livestream}
               onFinish={onFinish}
               onGroupJoin={onGroupJoin}
               targetGroupId={targetGroupId}
               cancelable={cancelable}
               groups={groups}
               promptOtherEventsOnFinal={promptOtherEventsOnFinal}
            >
               <RegistrationForm />
            </RegistrationContextProvider>
         </Dialog>
      )
   }
)

interface Props {
   open?: boolean
   onGroupJoin?: () => any
   handleClose: () => any
   onFinish: () => any
   livestream: LivestreamEvent
   groups: any[]
   promptOtherEventsOnFinal?: boolean
   targetGroupId?: string
}
export default RegistrationModal
