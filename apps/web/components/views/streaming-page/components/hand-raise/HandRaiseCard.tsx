import {
   HandRaise,
   HandRaiseState,
   isUserCanJoinPanel,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import { LoadingButton } from "@mui/lab"
import { Stack, Typography } from "@mui/material"
import { useUpdateUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUpdateUserHandRaiseState"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"

const styles = sxStyles({
   root: {
      borderRadius: "11px",
      p: 2,
      border: "1px solid",
      borderColor: "divider",
   },
})

type Props = {
   handRaise: HandRaise
}

export const HandRaiseCard = ({ handRaise }: Props) => {
   const { livestreamId } = useStreamingContext()

   const {
      trigger: updateUserHandRaiseState,
      isMutating: isUpdatingUserHandRaiseState,
   } = useUpdateUserHandRaiseState(livestreamId, handRaise.id)

   return (
      <Stack sx={styles.root} spacing={1} p={1} key={handRaise.id}>
         <Typography>{handRaise.name}</Typography>
         {isUserCanJoinPanel(handRaise) ? (
            <LoadingButton
               color="error"
               variant="text"
               onClick={() => updateUserHandRaiseState(HandRaiseState.denied)}
               loading={isUpdatingUserHandRaiseState}
            >
               Remove participant
            </LoadingButton>
         ) : (
            <Stack direction="row" spacing={1.5}>
               <LoadingButton
                  fullWidth
                  onClick={() =>
                     updateUserHandRaiseState(HandRaiseState.denied)
                  }
                  loading={isUpdatingUserHandRaiseState}
                  color="grey"
                  variant="outlined"
               >
                  Deny
               </LoadingButton>
               <LoadingButton
                  fullWidth
                  onClick={() =>
                     updateUserHandRaiseState(HandRaiseState.invited)
                  }
                  loading={isUpdatingUserHandRaiseState}
                  color="primary"
                  variant="contained"
               >
                  Approve
               </LoadingButton>
            </Stack>
         )}
      </Stack>
   )
}
