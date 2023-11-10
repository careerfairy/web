import { Badge, Collapse } from "@mui/material"
import { CircularButton } from "./CircularButton"
import { Link2 } from "react-feather"
import React from "react"

export const CallToActionsButton = () => {
   const [showCallToActionsButton, setShowCallToActionsButton] =
      React.useState(true)

   return (
      <Collapse
         orientation="horizontal"
         unmountOnExit
         in={showCallToActionsButton}
      >
         <Badge color="error" badgeContent={2}>
            <CircularButton
               onClick={() => setShowCallToActionsButton(false)}
               color="primary"
            >
               <Link2 />
            </CircularButton>
         </Badge>
      </Collapse>
   )
}
