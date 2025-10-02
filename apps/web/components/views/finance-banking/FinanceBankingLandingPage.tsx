import { Box } from "@mui/material"
import { HeroSectionFinanceBanking } from "./HeroSectionFinanceBanking"
import { AboutSectionFinanceBanking } from "./AboutSectionFinanceBanking"
import { CompaniesSectionFinanceBanking } from "./CompaniesSectionFinanceBanking"
import { TestimonialsSection } from "../consulting/TestimonialsSection"
import { StatsSection } from "../consulting/StatsSection"
import { FAQSectionFinanceBanking } from "./FAQSectionFinanceBanking"
import { CTASection } from "../consulting/CTASection"

export function FinanceBankingLandingPage() {
   return (
      <Box>
         <HeroSectionFinanceBanking />
         <AboutSectionFinanceBanking />
         <CompaniesSectionFinanceBanking />
         <TestimonialsSection />
         <StatsSection />
         <FAQSectionFinanceBanking />
         <CTASection />
      </Box>
   )
}