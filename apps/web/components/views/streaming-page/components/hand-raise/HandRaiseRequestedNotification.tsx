import {
   HandRaise,
   HandRaiseState,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import { LoadingButton } from "@mui/lab"
import { Stack, Typography } from "@mui/material"
import { useUpdateUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUpdateUserHandRaiseState"
import CustomNotification from "components/views/notifications/CustomNotification"
import { SnackbarKey } from "notistack"
import { ReactNode, forwardRef } from "react"

type Props = {
   handRaise: HandRaise
   livestreamId: string
   message: ReactNode
   id: SnackbarKey
}

export const HandRaiseRequestedNotification = forwardRef<HTMLDivElement, Props>(
   ({ handRaise, livestreamId, message, id }, ref) => {
      const {
         trigger: updateUserHandRaiseState,
         isMutating: isUpdatingUserHandRaiseState,
      } = useUpdateUserHandRaiseState(livestreamId)

      return (
         <CustomNotification
            id={id}
            ref={ref}
            title="New hand raiser"
            variant="success"
            content={
               <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Typography variant="small">{message}</Typography>
                  <Stack direction="row" spacing={1}>
                     <LoadingButton
                        loading={isUpdatingUserHandRaiseState}
                        onClick={() =>
                           updateUserHandRaiseState({
                              state: HandRaiseState.unrequested,
                              handRaiseId: handRaise.id,
                           })
                        }
                        size="small"
                        color="grey"
                        variant="outlined"
                     >
                        Deny
                     </LoadingButton>
                     <LoadingButton
                        loading={isUpdatingUserHandRaiseState}
                        onClick={() =>
                           updateUserHandRaiseState({
                              state: HandRaiseState.invited,
                              handRaiseId: handRaise.id,
                           })
                        }
                        size="small"
                        color="primary"
                        variant="contained"
                     >
                        Approve
                     </LoadingButton>
                  </Stack>
               </Stack>
            }
         />
      )
   }
)
HandRaiseRequestedNotification.displayName = "HandRaiseRequestedNotification"
