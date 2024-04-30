import { LoadingButton } from "@mui/lab"
import { Stack } from "@mui/material"
import { useToggleHandRaise } from "components/custom-hook/streaming/hand-raise/useToggleHandRaise"
import { forwardRef } from "react"
import { TransitionGroup } from "react-transition-group"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"

const styles = sxStyles({
   root: {
      px: 2,
      py: 1.5,
   },
})

export const HandRaiseManager = forwardRef<HTMLDivElement>((_, ref) => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { trigger: toggleHandRaise, isMutating } = useToggleHandRaise(
      livestreamId,
      agoraUserId
   )

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
            Hand raisers
         </Stack>
      </Stack>
   )
})

HandRaiseManager.displayName = "HandRaiseManager"
