import { Button, Typography } from "@mui/material"
import { StyledFinalCTA } from "./styles"

const FinalCTASection = () => {
   return (
      <StyledFinalCTA>
         <Typography
            variant="h3"
            fontWeight={800}
            textAlign="center"
            color="#3D3D47"
            sx={{
               fontSize: { xs: "28px", md: "40px" },
               lineHeight: 1.5,
               letterSpacing: "-5%",
            }}
         >
            Get your brand seen now!
         </Typography>
         <Button
            variant="contained"
            size="large"
            sx={{
               backgroundColor: "#6749EA",
               borderRadius: "20px",
               textTransform: "none",
               padding: "8px 24px",
               fontSize: "16px",
               width: { xs: "258px", md: "auto" },
            }}
         >
            Start your free trial!
         </Button>
      </StyledFinalCTA>
   )
}

export default FinalCTASection
