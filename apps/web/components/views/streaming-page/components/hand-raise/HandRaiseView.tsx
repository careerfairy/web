import { CollapseAndGrow } from "components/util/animations"
import { Fragment } from "react"
import { useStreamHandRaiseActive } from "store/selectors/streamingAppSelectors"
import { HandRaiseInactive } from "./HandRaiseInactive"
import { HandRaiseManager } from "./HandRaiseManager"

export const HostHandRaiseView = () => {
   const handRaiseIsActive = useStreamHandRaiseActive()

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
