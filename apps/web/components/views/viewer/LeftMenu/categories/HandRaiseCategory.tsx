import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { HandRaiseState } from "@careerfairy/shared-lib/src/livestreams/hand-raise"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import useHandRaiseState from "../../../../custom-hook/useHandRaiseState"
import HandRaisePromptDialog from "./hand-raise/HandRaisePromptDialog"
import HandRaiseAcquiringMedia from "./hand-raise/active/HandRaiseAcquiringMedia"
import HandRaiseConnected from "./hand-raise/active/HandRaiseConnected"
import HandRaiseConnecting from "./hand-raise/active/HandRaiseConnecting"
import HandRaiseDenied from "./hand-raise/active/HandRaiseDenied"
import HandRaisePriorRequest from "./hand-raise/active/HandRaisePriorRequest"
import HandRaiseRequested from "./hand-raise/active/HandRaiseRequested"
import HandRaiseInactive from "./hand-raise/inactive/HandRaiseInactive"

const HandRaiseCategory = ({
   livestream,
   selectedState,
   setHandRaiseActive,
   isMobile,
}: Props) => {
   const dispatch = useDispatch()
   const [handRaiseState, updateHandRaiseRequest] = useHandRaiseState()

   useEffect(() => {
      if (
         !isMobile &&
         livestream.hasStarted &&
         livestream.handRaiseActive &&
         handRaiseState &&
         [
            HandRaiseState.connecting,
            HandRaiseState.connected,
            HandRaiseState.requested,
            HandRaiseState.invited,
            HandRaiseState.acquire_media,
         ].includes(handRaiseState.state)
      ) {
         setHandRaiseActive(true)
      } else {
         setHandRaiseActive(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      handRaiseState?.state,
      livestream.handRaiseActive,
      livestream.hasStarted,
      isMobile,
   ])

   // useEffect(() => {
   //    if (handRaiseState?.state === "invited") {
   //       // You should be able to immediately join after being invited, as your devices are set
   //       void startConnectingHandRaise();
   //    }
   // }, [handRaiseState?.state]);

   useEffect(() => {
      if (handRaiseState?.state === "connected") {
         // If you mount or reload the stream page after previously being
         // connected, you should be put back in the connecting phase
         void updateHandRaiseRequest(HandRaiseState.connecting)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   const requestHandRaise = async () => {
      try {
         await updateHandRaiseRequest(HandRaiseState.requested)
         dispatch(actions.enqueueSuccessfulHandRaiseRequest())
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
   }
   const unRequestHandRaise = () => {
      return updateHandRaiseRequest(HandRaiseState.unrequested)
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const startConnectingHandRaise = () => {
      return updateHandRaiseRequest(HandRaiseState.connecting)
   }

   if (!livestream.handRaiseActive || !livestream.hasStarted) {
      return <HandRaiseInactive selectedState={selectedState} />
   }

   return (
      <>
         <HandRaisePriorRequest
            handRaiseState={handRaiseState}
            updateHandRaiseRequest={updateHandRaiseRequest}
         />
         <HandRaiseAcquiringMedia handRaiseState={handRaiseState} />
         <HandRaiseRequested
            handRaiseState={handRaiseState}
            requestHandRaise={requestHandRaise}
            unRequestHandRaise={unRequestHandRaise}
            handRaiseActive={livestream.handRaiseActive}
         />
         <HandRaiseDenied
            handRaiseState={handRaiseState}
            updateHandRaiseRequest={updateHandRaiseRequest}
         />
         <HandRaiseConnecting
            handRaiseState={handRaiseState}
            updateHandRaiseRequest={updateHandRaiseRequest}
         />
         <HandRaiseConnected
            handRaiseState={handRaiseState}
            updateHandRaiseRequest={updateHandRaiseRequest}
         />
         {/*<HandRaiseJoinDialog*/}
         {/*   open={handRaiseState?.state === HandRaiseState.invited}*/}
         {/*   onClose={unRequestHandRaise}*/}
         {/*   startConnectingHandRaise={startConnectingHandRaise}*/}
         {/*/>*/}
         <HandRaisePromptDialog />
      </>
   )
}
type Props = {
   livestream: LivestreamEvent
   selectedState: string
   setHandRaiseActive: (active: boolean) => any
   isMobile: boolean
}
export default HandRaiseCategory
