import { Button } from "@mui/material"
import { StyledCTATitle, StyledFinalCTA } from "./styles"

const FinalCTASection = () => {
   return (
      <StyledFinalCTA>
         <StyledCTATitle>
            Get your brand <br /> seen now!
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

export default FinalCTASection
