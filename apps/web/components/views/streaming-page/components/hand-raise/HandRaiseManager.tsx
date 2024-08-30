import {
   HandRaise,
   HandRaiseState,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import { LoadingButton } from "@mui/lab"
import { Grid, Stack } from "@mui/material"
import { useStreamIsLandscape } from "components/custom-hook/streaming"
import { useHandRaisers } from "components/custom-hook/streaming/hand-raise/useHandRaisers"
import { useToggleHandRaise } from "components/custom-hook/streaming/hand-raise/useToggleHandRaise"
import { CollapseAndGrow } from "components/util/animations"
import { Timestamp } from "data/firebase/FirebaseInstance"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { useLivestreamTutorial } from "../tutorial/LivestreamTutorialProvider"
import { TutorialSteps } from "../tutorial/TutorialSteps"
import { HandRaiseCard } from "./HandRaiseCard"

const styles = sxStyles({
   root: {
      px: 2,
      py: 1.5,
   },
})

export const HandRaiseManager = forwardRef<HTMLDivElement>((_, ref) => {
   const streamIsLandscape = useStreamIsLandscape()

   const { isActive: isTutorialActive, activeStepId } = useLivestreamTutorial()
   const { livestreamId, streamerAuthToken } = useStreamingContext()
   const { trigger: toggleHandRaise, isMutating } = useToggleHandRaise(
      livestreamId,
      streamerAuthToken
   )

   const { data: handRaisers } = useHandRaisers(livestreamId)

   const demoHandRaisers: HandRaise[] = [
      {
         id: "",
         name: "Albert E.",
         state: HandRaiseState.requested,
         timeStamp: Timestamp.fromDate(new Date()),
      },
   ]

   const allHandRaisers =
      isTutorialActive && activeStepId === TutorialSteps.HAND_RAISE_3
         ? demoHandRaisers
         : handRaisers

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
               {allHandRaisers.map((handRaise) => (
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
