import { Badge } from "@mui/material"
import { CircularButton } from "./CircularButton"
import { Link2 } from "react-feather"
import React from "react"
import { useAppDispatch } from "hooks"
import { setActiveView, ActiveViews } from "store/streamingAppSlice"

export const CallToActionsButton = () => {
   const dispatch = useAppDispatch()

   const handleClick = () => {
      dispatch(setActiveView(ActiveViews.CTA))
   }

   return (
      <Badge color="error" badgeContent={2}>
         <CircularButton onClick={handleClick} color="primary">
            <Link2 />
         </CircularButton>
      </Badge>
   )
}
