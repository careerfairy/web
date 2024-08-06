import { useAppDispatch } from "components/custom-hook/store"
import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { useLivestreamActiveCTA } from "components/custom-hook/streaming/call-to-action/useLivestreamActiveCTA"
import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"
import { useEffect, useState } from "react"
import { Link2 } from "react-feather"
import { ActiveViews, setActiveView } from "store/reducers/streamingAppReducer"
import { useStreamingContext } from "../../context"
import { CircularButton } from "./CircularButton"

export const CallsToActionButton = () => {
   const dispatch = useAppDispatch()
   const { livestreamId } = useStreamingContext()
   const { data: activeCTA } = useLivestreamActiveCTA(livestreamId)
   const [newActiveCTA, setNewActiveCTA] = useState<string[]>([])
   const { isActive: isCTAPanelActive } = useActiveSidePanelView(
      ActiveViews.CTA
   )

   useEffect(() => {
      const now = new Date().getTime()
      const newCTA = activeCTA
         .filter(
            (cta) =>
               now - cta.activatedAt?.toDate().getTime() <= 3000 || // check if CTA was dispatched in the past 3 seconds
               (newActiveCTA.includes(cta.id) && cta.active) // ensures already dispatched notifications don't get lost
         )
         .map((cta) => cta.id)
      setNewActiveCTA(newCTA)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeCTA])

   const handleClick = () => {
      dispatch(setActiveView(ActiveViews.CTA))
      setNewActiveCTA([])
   }

   return (
      <BrandedBadge
         color="error"
         variant="branded"
         badgeContent={!isCTAPanelActive ? newActiveCTA?.length : null}
      >
         <CircularButton onClick={handleClick} color="primary">
            <Link2 />
         </CircularButton>
      </BrandedBadge>
   )
}
