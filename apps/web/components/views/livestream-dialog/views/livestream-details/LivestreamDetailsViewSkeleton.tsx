import BaseDialogView, { HeroContent } from "../../BaseDialogView"
import Stack from "@mui/material/Stack"
import { HostInfoSkeleton } from "./HostInfo"
import { LivestreamTitleSkeleton } from "./LivestreamTitle"
import { LivestreamTagsContainerSkeleton } from "./LivestreamTagsContainer"
import { DummyMainContent } from "./LivestreamDetailsView"

const LivestreamDetailsViewSkeleton = () => {
   return (
      <BaseDialogView
         heroContent={
            <HeroContent>
               <Stack alignItems="center" justifyContent={"center"} spacing={2}>
                  <HostInfoSkeleton />
                  <LivestreamTitleSkeleton />
                  <LivestreamTagsContainerSkeleton />
               </Stack>
            </HeroContent>
         }
         mainContent={<DummyMainContent />}
      />
   )
}

export default LivestreamDetailsViewSkeleton
