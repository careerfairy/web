import { LoadingButton } from "@mui/lab"
import { Grid, Stack } from "@mui/material"
import { useStreamIsLandscape } from "components/custom-hook/streaming"
import { useHandRaisers } from "components/custom-hook/streaming/hand-raise/useHandRaisers"
import { useToggleHandRaise } from "components/custom-hook/streaming/hand-raise/useToggleHandRaise"
import { CollapseAndGrow } from "components/util/animations"
import { forwardRef } from "react"
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
   const streamIsLandscape = useStreamIsLandscape()

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
         <Grid container>
            <Grid spacing={1.5} container>
               {handRaisers.map((handRaise) => (
                  <Grid item xs={streamIsLandscape ? 6 : 12} key={handRaise.id}>
                     <CollapseAndGrow in>
                        <HandRaiseCard handRaise={handRaise} />
                     </CollapseAndGrow>
                  </Grid>
               ))}
            </Grid>
         </Grid>
      </Stack>
   )
})

HandRaiseManager.displayName = "HandRaiseManager"
