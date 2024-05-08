import { CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { CollapseAndGrow } from "components/util/animations"
import { Fragment } from "react"
import { useStreamHandRaiseEnabled } from "store/selectors/streamingAppSelectors"
import { HandRaiseInactive } from "./HandRaiseInactive"
import { HandRaiseManager } from "./HandRaiseManager"

export const HostHandRaiseView = () => {
   const handRaiseEnabled = useStreamHandRaiseEnabled()

   return (
      <Fragment>
         <CollapseAndGrow in={handRaiseEnabled}>
            <SuspenseWithBoundary fallback={<CircularProgress />}>
               <HandRaiseManager />
            </SuspenseWithBoundary>
         </CollapseAndGrow>
         <CollapseAndGrow in={!handRaiseEnabled}>
            <HandRaiseInactive />
         </CollapseAndGrow>
      </Fragment>
   )
}
