import { Box, Card, Container, Stack, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"

export const StyledContainer = styled(Container)(({ theme }) => ({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   gap: "24px",
   padding: "24px 32px",
   [theme.breakpoints.down("md")]: {
      padding: "12px 0px",
   },
}))

export const StyledPageBackground = styled(Box)(({ theme }) => ({
   background: `linear-gradient(180deg, rgba(147, 215, 208, 0.15) 6.95%, rgba(34, 117, 216, 0.15) 69.54%), #FCFCFE`,
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
      gap: "24px",
      padding: "32px 16px",
      border: "none",
   },
}))

export const StyledHeroContent = styled(Box)({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   gap: "32px",
   width: "100%",
})

export const StyledBrandAwarenessCard = styled(Box)(({ theme }) => ({
   backgroundColor: "#F7F9FF",
   borderRadius: "12px",
   padding: "16px",
   boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.05)",
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   gap: "12px",
   width: "100%",
   maxWidth: "592px",
   [theme.breakpoints.down("md")]: {
      maxWidth: "none",
   },
}))

export const StyledProgressSection = styled(Box)({
   display: "flex",
   flexDirection: "column",
   gap: "12px",
   width: "100%",
})

export const StyledProgressHeader = styled(Box)({
   display: "flex",
   alignItems: "center",
   gap: "8px",
})

export const StyledProgressIcon = styled(Box)(({ theme }) => ({
   backgroundColor: "#DCF8E6",
   borderRadius: "12px",
   padding: "8px",
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   width: "44px",
   height: "44px",
   [theme.breakpoints.down("md")]: {
      width: "56px",
      height: "56px",
      padding: "12px",
   },
}))

export const StyledPricingSection = styled(Box)(({ theme }) => ({
   display: "flex",
   gap: "16px",
   width: "100%",
   maxWidth: "592px",
   [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      maxWidth: "none",
   },
}))

export const StyledPricingCard = styled(Card)(({ theme }) => ({
   borderRadius: "12px",
   display: "flex",
   flexDirection: "column",
   justifyContent: "space-between",
   padding: "12px",
   width: "288px",
   height: "311px",
   [theme.breakpoints.down("md")]: {
      width: "100%",
   },
}))

export const StyledTrialCard = styled(StyledPricingCard)({
   background: "linear-gradient(135deg, #26C6DA 0%, #00BFA6 100%)",
   position: "relative",
})

export const StyledTrialCardTitle = styled(Typography)(({ theme }) => ({
   fontSize: 24,
   fontWeight: 900,
   color: theme.brand.white[100],
   fontStyle: "italic",
}))

export const StyledTrialCardFreeTag = styled(Box)(() => ({
   position: "absolute",
   top: 15,
   right: -44.773,
   backgroundColor: "#23546E",
   color: "white",
   padding: "4px 12px",
   borderRadius: "4px",
   fontSize: "14px",
   textAlign: "center",
   width: 175,
   transform: "rotate(32.189deg)",
}))

export const StyledCardBenefits = styled(Stack)(({ theme }) => ({
   color: theme.brand.white[300],
   "& svg": {
      color: theme.brand.white[300],
   },
}))

export const StyledFullCard = styled(StyledPricingCard)({
   background: "linear-gradient(135deg, #7454FF 0%, #6749EA 100%)",
})

export const StyledBenefitsSection = styled(Box)(({ theme }) => ({
   backgroundColor: "#FAFAFE",
   borderRadius: "12px",
   padding: "24px",
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   gap: "16px",
   width: "100%",
   maxWidth: "942px",
   [theme.breakpoints.down("md")]: {
      padding: "8px",
      maxWidth: "none",
   },
}))

export const StyledBenefitsGrid = styled(Box)(({ theme }) => ({
   display: "grid",
   gridTemplateColumns: "repeat(2, 1fr)",
   gap: "16px",
   width: "100%",
   [theme.breakpoints.down("md")]: {
      display: "none",
   },
}))

export const StyledBenefitCard = styled(Box)(({ theme }) => ({
   backgroundColor: "#FFFFFF",
   borderRadius: "8px",
   padding: "12px",
   display: "flex",
   flexDirection: "column",
   gap: "12px",
   [theme.breakpoints.down("md")]: {
      minWidth: "299px",
      padding: "8px",
   },
}))

export const StyledMockupContainer = styled(Box)(({ theme }) => ({
   backgroundColor: "#E6F3FB",
   borderRadius: "4px",
   height: "158px",
   position: "relative",
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   [theme.breakpoints.down("md")]: {
      height: "120px",
   },
}))

export const StyledFinalCTA = styled(Box)(({ theme }) => ({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   gap: "12px",
   width: "100%",
   maxWidth: "904px",
   [theme.breakpoints.down("md")]: {
      maxWidth: "none",
   },
}))
