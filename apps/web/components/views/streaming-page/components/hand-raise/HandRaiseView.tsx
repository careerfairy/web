import { CollapseAndGrow } from "components/util/animations"
import { Fragment } from "react"
import { useHandRaiseActive } from "store/selectors/streamingAppSelectors"
import { HandRaiseInactive } from "./HandRaiseInactive"
import { HandRaiseManager } from "./HandRaiseManager"

export const HostHandRaiseView = () => {
   const handRaiseIsActive = useHandRaiseActive()

   return (
      <Fragment>
         <CollapseAndGrow in={handRaiseIsActive}>
            <HandRaiseManager />
         </CollapseAndGrow>
         <CollapseAndGrow in={!handRaiseIsActive}>
            <HandRaiseInactive />
         </CollapseAndGrow>
      </Fragment>
   )
}
