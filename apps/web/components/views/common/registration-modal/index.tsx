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
      onQuestionsAnswered,
      onFinish,
      targetGroupId,
      isRecommended,
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
               onQuestionsAnswered={onQuestionsAnswered}
               targetGroupId={targetGroupId}
               cancelable={cancelable}
               groups={groups}
               promptOtherEventsOnFinal={promptOtherEventsOnFinal}
               isRecommended={isRecommended}
            >
               <RegistrationForm />
            </RegistrationContextProvider>
         </Dialog>
      )
   }
)

RegistrationModal.displayName = "RegistrationModal"

interface Props {
   open?: boolean
   onQuestionsAnswered?: (...any) => void
   handleClose?: () => any
   onFinish?: () => any
   livestream: LivestreamEvent
   groups: any[]
   promptOtherEventsOnFinal?: boolean
   targetGroupId?: string
   isRecommended?: boolean
}
export default RegistrationModal
