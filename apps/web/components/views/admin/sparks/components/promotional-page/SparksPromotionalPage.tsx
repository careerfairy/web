import { BenefitsSection } from "./BenefitsSection"
import { FinalCTASection } from "./FinalCTASection"
import { HeroSection } from "./HeroSection"
import { StyledContainer, StyledPageBackground } from "./styles"

export const SparksPromotionalPage = () => {
   return (
      <StyledContainer maxWidth="xl">
         <StyledPageBackground>
            <HeroSection />
            <BenefitsSection />
            <FinalCTASection />
         </StyledPageBackground>
      </StyledContainer>
   )
}
