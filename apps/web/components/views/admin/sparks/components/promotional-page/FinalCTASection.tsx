import { Button } from "@mui/material"
import { StyledCTATitle, StyledFinalCTA } from "./styles"

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
