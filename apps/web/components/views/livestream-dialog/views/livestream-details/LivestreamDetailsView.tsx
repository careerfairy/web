import { FC } from "react"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import Stack from "@mui/material/Stack"
import LivestreamTagsContainer, {
   LivestreamTagsContainerSkeleton,
} from "./LivestreamTagsContainer"
import HostInfo, { HostInfoSkeleton } from "./HostInfo"
import LivestreamTitle, { LivestreamTitleSkeleton } from "./LivestreamTitle"

const LivestreamDetailsView: FC = () => {
   const { livestream, livestreamPresenter } = useLiveStreamDialog()

   if (!livestream) return <LivestreamDetailsViewSkeleton />

   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               backgroundImg={getResizedUrl(
                  livestream.backgroundImageUrl,
                  "lg"
               )}
            >
               <Stack
                  alignItems="center"
                  justifyContent={"center"}
                  spacing={2.5}
               >
                  <HostInfo presenter={livestreamPresenter} />
                  <LivestreamTitle text={livestream.title} />
                  <LivestreamTagsContainer presenter={livestreamPresenter} />
               </Stack>
            </HeroContent>
         }
         mainContent={<DummyMainContent />}
      />
   )
}

export const LivestreamDetailsViewSkeleton = () => {
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

const DummyMainContent: FC = () => {
   return (
      <MainContent>
         <Stack pt={2} spacing={2}>
            {/* For Demo Purposes */}
            {Array.from({ length: 15 }).map((_, i) => (
               <HostInfoSkeleton key={i} />
            ))}
         </Stack>
      </MainContent>
   )
}

export default LivestreamDetailsView
