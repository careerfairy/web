import { Box } from "@mui/material"
import { HeroSectionEngineering } from "./HeroSectionEngineering"
import { AboutSectionEngineering } from "./AboutSectionEngineering"
import { CompaniesSectionEngineering } from "./CompaniesSectionEngineering"
import { TestimonialsSection } from "../consulting/TestimonialsSection"
import { StatsSection } from "../consulting/StatsSection"
import { FAQSectionEngineering } from "./FAQSectionEngineering"
import { CTASection } from "../consulting/CTASection"

export function EngineeringLandingPage() {
   return (
      <Box>
         <HeroSectionEngineering />
         <AboutSectionEngineering />
         <CompaniesSectionEngineering />
         <TestimonialsSection />
         <StatsSection />
         <FAQSectionEngineering />
         <CTASection />
      </Box>
   )
}