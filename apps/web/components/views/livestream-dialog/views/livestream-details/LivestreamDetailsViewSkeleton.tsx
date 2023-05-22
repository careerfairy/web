import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import Stack from "@mui/material/Stack"
import { HostInfoSkeleton } from "./HostInfo"
import { LivestreamTitleSkeleton } from "./LivestreamTitle"
import { LivestreamTagsContainerSkeleton } from "./LivestreamTagsContainer"
import { CountdownTimerSkeleton } from "./CountDownTimer"
import { ActionButtonSkeleton } from "./action-button/ActionButton"
import { SpeakersSkeleton } from "./main-content/Speakers"
import { AboutLivestreamSkeleton } from "./main-content/AboutLivestream"
import { AboutCompanySkeleton } from "./main-content/AboutCompany"
import { QuestionsSkeleton } from "./main-content/Questions"
import Section from "./main-content/Section"

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
         mainContent={
            <MainContent>
               <Section>
                  <SpeakersSkeleton />
                  <Section>
                     <AboutLivestreamSkeleton />
                  </Section>
               </Section>
               <Section>
                  <AboutCompanySkeleton />
               </Section>
               <Section>
                  <QuestionsSkeleton />
               </Section>
            </MainContent>
         }
      />
   )
}

export default LivestreamDetailsViewSkeleton
