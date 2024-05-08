import {
   HandRaise,
   HandRaiseState,
   isUserCanJoinPanel,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import { LoadingButton } from "@mui/lab"
import { Stack, Typography } from "@mui/material"
import { useUpdateUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUpdateUserHandRaiseState"
import { useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { useStreamingContext } from "../../context"
import { UserType } from "../../util"
import { UserDetails } from "../UserDetails"

const styles = sxStyles({
   root: {
      borderRadius: "11px",
      p: 2,
      border: "1px solid",
      borderColor: "divider",
      backgroundColor: "transparent",
      transition: (theme) => theme.transitions.create("background-color"),
   },
   greenBackground: {
      backgroundColor: "primary.main",
      color: "white",
   },
   removeButton: {
      backgroundColor: (theme) => theme.brand.white[50],
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[100],
      },
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
   } = useUpdateUserHandRaiseState(livestreamId)

   const timeSinceHandRaise = useTimeSinceHandRaise(handRaise)

   const isGreenBackground =
      handRaise.state === HandRaiseState.connecting ||
      handRaise.state === HandRaiseState.connected

   return (
      <Stack
         sx={[styles.root, isGreenBackground && styles.greenBackground]}
         spacing={3}
         p={1}
         key={handRaise.id}
      >
         <Stack spacing={1.5}>
            {handRaise.state === HandRaiseState.requested && (
               <Typography color="primary" variant="small">
                  Raised hands {timeSinceHandRaise}
               </Typography>
            )}
            {handRaise.state === HandRaiseState.invited && (
               <Typography color="primary" variant="small">
                  Invited to panel
               </Typography>
            )}
            {handRaise.state === HandRaiseState.connecting && (
               <Typography variant="small">Connecting to the panel</Typography>
            )}
            {handRaise.state === HandRaiseState.connected && (
               <Typography variant="small">Currently participating</Typography>
            )}
            <UserDetails
               displayName={handRaise.name}
               userType={UserType.Viewer}
               color={isGreenBackground ? "white" : undefined}
            />
         </Stack>
         {isUserCanJoinPanel(handRaise) ? (
            <LoadingButton
               color="error"
               variant="text"
               onClick={() =>
                  updateUserHandRaiseState({
                     state: HandRaiseState.denied,
                     handRaiseId: handRaise.id,
                  })
               }
               loading={isUpdatingUserHandRaiseState}
               sx={styles.removeButton}
            >
               Remove participant
            </LoadingButton>
         ) : (
            <Stack direction="row" spacing={1.5}>
               <LoadingButton
                  fullWidth
                  onClick={() =>
                     updateUserHandRaiseState({
                        state: HandRaiseState.unrequested,
                        handRaiseId: handRaise.id,
                     })
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
                     updateUserHandRaiseState({
                        state: HandRaiseState.invited,
                        handRaiseId: handRaise.id,
                     })
                  }
                  disabled={handRaise.state === HandRaiseState.invited}
                  loading={isUpdatingUserHandRaiseState}
                  color="primary"
                  variant="contained"
               >
                  {handRaise.state === HandRaiseState.invited
                     ? "Invited"
                     : "Approve"}
               </LoadingButton>
            </Stack>
         )}
      </Stack>
   )
}

const useTimeSinceHandRaise = (entry: HandRaise) => {
   const [timeSince, setTimeSince] = useState(() =>
      DateUtil.getTimeAgo(entry.timeStamp.toDate())
   )

   useEffect(() => {
      // Function to periodically refresh the "time since" string
      const refreshTimeSince = () => {
         setTimeSince(DateUtil.getTimeAgo(entry.timeStamp.toDate()))
      }

      // Refresh the "time since" every 15 seconds
      const interval = setInterval(refreshTimeSince, 15000)

      // Clear the interval when the component unmounts
      return () => clearInterval(interval)
   }, [entry.timeStamp])

   return timeSince
}
