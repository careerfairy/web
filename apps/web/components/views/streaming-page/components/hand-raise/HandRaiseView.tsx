import { Slide } from "@mui/material"
import { useHandRaiseActive } from "store/selectors/streamingAppSelectors"
import { HandRaiseInactive } from "./HandRaiseInactive"
import { HandRaiseManager } from "./HandRaiseManager"

export const HostHandRaiseView = () => {
   const handRaiseIsActive = useHandRaiseActive()

   if (handRaiseIsActive) {
      return (
         <Slide in appear>
            <HandRaiseManager />
         </Slide>
      )
   }

   return (
      <Slide in appear>
         <HandRaiseInactive />
      </Slide>
   )
}
