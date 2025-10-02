import { Box } from "@mui/material"
import { HeroSectionFMCG } from "./HeroSectionFMCG"
import { AboutSectionFMCG } from "./AboutSectionFMCG"
import { CompaniesSectionFMCG } from "./CompaniesSectionFMCG"
import { TestimonialsSection } from "../consulting/TestimonialsSection"
import { StatsSection } from "../consulting/StatsSection"
import { FAQSectionFMCG } from "./FAQSectionFMCG"
import { CTASection } from "../consulting/CTASection"

export function FMCGLandingPage() {
   return (
      <Box>
         <HeroSectionFMCG />
         <AboutSectionFMCG />
         <CompaniesSectionFMCG />
         <TestimonialsSection />
         <StatsSection />
         <FAQSectionFMCG />
         <CTASection />
      </Box>
   )
}