import { Box } from "@mui/material"
import { HeroSectionFinanceBanking } from "./HeroSectionFinanceBanking"
import { AboutSectionFinanceBanking } from "./AboutSectionFinanceBanking"
import { CompaniesSectionFinanceBanking } from "./CompaniesSectionFinanceBanking"
import { TestimonialsWrapper } from "../common/TestimonialsWrapper"
import { StatsSection } from "../common/StatsSection"
import { FAQSectionFinanceBanking } from "./FAQSectionFinanceBanking"
import { CTASection } from "../common/CTASection"

export function FinanceBankingLandingPage() {
   return (
      <Box>
         <HeroSectionFinanceBanking />
         <AboutSectionFinanceBanking />
         <CompaniesSectionFinanceBanking />
         <TestimonialsWrapper />
         <StatsSection />
         <FAQSectionFinanceBanking />
         <CTASection />
      </Box>
   )
}