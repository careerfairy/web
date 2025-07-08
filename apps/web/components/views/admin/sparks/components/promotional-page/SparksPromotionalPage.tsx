import BenefitsSection from "./BenefitsSection"
import FinalCTASection from "./FinalCTASection"
import HeroSection from "./HeroSection"
import { StyledContainer } from "./styles"

const SparksPromotionalPage = () => {
   return (
      <StyledContainer maxWidth="xl">
         <HeroSection />
         <BenefitsSection />
         <FinalCTASection />
      </StyledContainer>
   )
}

export default SparksPromotionalPage
