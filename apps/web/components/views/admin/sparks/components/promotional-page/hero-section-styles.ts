import {
   Box,
   Card,
   LinearProgress,
   linearProgressClasses,
   Stack,
   Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"

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

export const StyledLinearProgress = styled(LinearProgress)({
   height: 14,
   borderRadius: 100,
   backgroundColor: "rgba(227, 233, 253, 0.56)",
   [`& .${linearProgressClasses.bar}`]: {
      backgroundColor: "#01AF3C",
      borderRadius: "100px",
   },
})
