import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import Stack from "@mui/material/Stack"
import { HostInfoSkeleton } from "../livestream-details/HostInfo"
import { LivestreamTitleSkeleton } from "../livestream-details/LivestreamTitle"
import Section from "../livestream-details/main-content/Section"

const RegisterDataConsentViewSkeleton = () => {
   return (
      <BaseDialogView
         heroContent={
            <HeroContent>
               <Stack alignItems="center" justifyContent={"center"} spacing={2}>
                  <HostInfoSkeleton />
                  <LivestreamTitleSkeleton />
               </Stack>
            </HeroContent>
         }
         mainContent={
            <MainContent>
               <Section>
                  <>Questions Skeleton</>
               </Section>
            </MainContent>
         }
      />
   )
}

export default RegisterDataConsentViewSkeleton
