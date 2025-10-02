import { Box } from "@mui/material"
import { HeroSectionFMCG } from "./HeroSectionFMCG"
import { AboutSectionFMCG } from "./AboutSectionFMCG"
import { CompaniesSectionFMCG } from "./CompaniesSectionFMCG"
import { TestimonialsWrapper } from "../common/TestimonialsWrapper"
import { StatsSection } from "../common/StatsSection"
import { FAQSectionFMCG } from "./FAQSectionFMCG"
import { CTASection } from "../common/CTASection"

export function FMCGLandingPage() {
   return (
      <Box>
         <HeroSectionFMCG />
         <AboutSectionFMCG />
         <CompaniesSectionFMCG />
         <TestimonialsWrapper />
         <StatsSection />
         <FAQSectionFMCG />
         <CTASection />
      </Box>
   )
}