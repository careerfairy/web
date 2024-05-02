import { LoadingButton } from "@mui/lab"
import { Collapse, Stack } from "@mui/material"
import { useHandRaisers } from "components/custom-hook/streaming/hand-raise/useHandRaisers"
import { useToggleHandRaise } from "components/custom-hook/streaming/hand-raise/useToggleHandRaise"
import { forwardRef } from "react"
import { TransitionGroup } from "react-transition-group"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { HandRaiseCard } from "./HandRaiseCard"

const styles = sxStyles({
   root: {
      px: 2,
      py: 1.5,
   },
})

export const HandRaiseManager = forwardRef<HTMLDivElement>((_, ref) => {
   const { livestreamId, streamerAuthToken } = useStreamingContext()
   const { trigger: toggleHandRaise, isMutating } = useToggleHandRaise(
      livestreamId,
      streamerAuthToken
   )

   const { data: handRaisers } = useHandRaisers(livestreamId)

   return (
      <Stack ref={ref} spacing={2} sx={styles.root}>
         <LoadingButton
            fullWidth
            variant="contained"
            onClick={toggleHandRaise}
            loading={isMutating}
         >
            Deactivate hand raise
         </LoadingButton>
         <Stack spacing={1.5} component={TransitionGroup}>
            {handRaisers.map((handRaise) => (
               <Collapse key={handRaise.id}>
                  <HandRaiseCard handRaise={handRaise} />
               </Collapse>
            ))}
         </Stack>
      </Stack>
   )
})

HandRaiseManager.displayName = "HandRaiseManager"
