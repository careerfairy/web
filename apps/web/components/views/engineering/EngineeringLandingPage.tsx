import { Box } from "@mui/material"
import { HeroSectionEngineering } from "./HeroSectionEngineering"
import { AboutSectionEngineering } from "./AboutSectionEngineering"
import { CompaniesSectionEngineering } from "./CompaniesSectionEngineering"
import { TestimonialsWrapper } from "../common/TestimonialsWrapper"
import { StatsSection } from "../common/StatsSection"
import { FAQSectionEngineering } from "./FAQSectionEngineering"
import { CTASection } from "../common/CTASection"

export function EngineeringLandingPage() {
   return (
      <Box>
         <HeroSectionEngineering />
         <AboutSectionEngineering />
         <CompaniesSectionEngineering />
         <TestimonialsWrapper />
         <StatsSection />
         <FAQSectionEngineering />
         <CTASection />
      </Box>
   )
}