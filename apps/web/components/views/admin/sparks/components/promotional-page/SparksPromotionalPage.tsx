import { Box, Container, styled } from "@mui/material"
import { BenefitsSection } from "./BenefitsSection"
import { FinalCTASection } from "./FinalCTASection"
import { HeroSection } from "./HeroSection"

export const StyledContainer = styled(Container)(({ theme }) => ({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   gap: "24px",
   padding: "24px 32px",
   [theme.breakpoints.down("md")]: {
      padding: "12px 0px 56px 0px",
   },
}))

export const StyledPageBackground = styled(Box)(({ theme }) => ({
   background: `linear-gradient(180deg, rgba(147, 215, 208, 0.15) 6.95%, rgba(34, 117, 216, 0.15) 69.54%), ${theme.brand.white[200]}`,
   borderRadius: "16px 16px 0px 0px",
   border: `1px solid ${theme.brand.white[400]}`,
   padding: "32px 20px",
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   gap: "32px",
   width: "100%",
   maxWidth: "1200px",
   [theme.breakpoints.down("md")]: {
      borderRadius: "16px",
      gap: "48px",
      padding: "32px 16px",
      border: "none",
   },
}))

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
