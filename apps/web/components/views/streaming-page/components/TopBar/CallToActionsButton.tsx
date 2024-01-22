import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"
import { CircularButton } from "./CircularButton"
import { Link2 } from "react-feather"
import React from "react"
import { useAppDispatch } from "components/custom-hook/store"
import { setActiveView, ActiveViews } from "store/reducers/streamingAppReducer"

export const CallToActionsButton = () => {
   const dispatch = useAppDispatch()

   const handleClick = () => {
      dispatch(setActiveView(ActiveViews.CTA))
   }

   return (
      <BrandedBadge color="error" variant="branded" badgeContent={2}>
         <CircularButton onClick={handleClick} color="primary">
            <Link2 />
         </CircularButton>
      </BrandedBadge>
   )
}
