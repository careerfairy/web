import { Button, styled, Typography } from "@mui/material"
import { Box } from "@mui/system"

export const StyledCTATitle = styled(Typography)(({ theme }) => ({
   fontSize: 40,
   fontWeight: 800,
   color: theme.palette.neutral[800],
   letterSpacing: "-2px",
   textAlign: "center",
   [theme.breakpoints.down("md")]: {
      fontSize: 28,
      letterSpacing: "-1.4px",
      lineHeight: 1.09,
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

export const FinalCTASection = () => {
   return (
      <StyledFinalCTA>
         <StyledCTATitle>
            Get&nbsp;your&nbsp;brand seen&nbsp;now!
         </StyledCTATitle>
         <Button
            variant="contained"
            size="medium"
            color="secondary"
            sx={{ width: 258 }}
         >
            Start your free trial!
         </Button>
      </StyledFinalCTA>
   )
}
