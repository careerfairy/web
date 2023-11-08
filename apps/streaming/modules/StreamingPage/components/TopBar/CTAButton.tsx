import { Badge } from "@mui/material"
import { CircularButton } from "./CircularButton"
import { Link2 } from "react-feather"

export const CTAButton = () => {
   return (
      <CircularButton color="primary">
         <Badge color="error" badgeContent={2}>
            <Link2 />
         </Badge>
      </CircularButton>
   )
}
