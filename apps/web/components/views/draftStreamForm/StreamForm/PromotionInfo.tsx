import { Typography } from "@mui/material"
import FormGroup from "../FormGroup"

type Props = {}

const PromotionInfo = ({}: Props) => {
   //TODO GS: create promotion inputs
   return (
      <>
         <Typography fontWeight="bold" variant="h4">
            Promotion
         </Typography>
         <Typography variant="subtitle1" mt={1} color="textSecondary">
            Choose promotion options to advertise this event
         </Typography>

         <FormGroup container boxShadow={0}></FormGroup>
      </>
   )
}

export default PromotionInfo
