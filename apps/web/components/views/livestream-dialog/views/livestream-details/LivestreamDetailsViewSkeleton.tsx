import BaseDialogView, { HeroContent } from "../../BaseDialogView"
import Stack from "@mui/material/Stack"
import { HostInfoSkeleton } from "./HostInfo"
import { LivestreamTitleSkeleton } from "./LivestreamTitle"
import { LivestreamTagsContainerSkeleton } from "./LivestreamTagsContainer"
import { DummyMainContent } from "./LivestreamDetailsView"
import { CountdownTimerSkeleton } from "./CountDownTimer"
import { ActionButtonSkeleton } from "./action-button/ActionButton"

const LivestreamDetailsViewSkeleton = () => {
   return (
      <BaseDialogView
         heroContent={
            <HeroContent>
               <Stack alignItems="center" justifyContent={"center"} spacing={2}>
                  <HostInfoSkeleton />
                  <LivestreamTitleSkeleton />
                  <LivestreamTagsContainerSkeleton />
                  <CountdownTimerSkeleton />
                  <ActionButtonSkeleton />
               </Stack>
            </HeroContent>
         }
         mainContent={<DummyMainContent />}
      />
   )
}

export default LivestreamDetailsViewSkeleton
