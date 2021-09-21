import React, { useEffect } from "react";
import HandRaisePriorRequest from "./hand-raise/active/HandRaisePriorRequest";
import HandRaiseRequested from "./hand-raise/active/HandRaiseRequested";
import HandRaiseDenied from "./hand-raise/active/HandRaiseDenied";
import HandRaiseConnecting from "./hand-raise/active/HandRaiseConnecting";
import HandRaiseConnected from "./hand-raise/active/HandRaiseConnected";
import HandRaiseInactive from "./hand-raise/inactive/HandRaiseInactive";
import useHandRaiseState from "../../../../custom-hook/useHandRaiseState";
import HandRaiseJoinDialog from "./hand-raise/HandRaiseJoinDialog";

const HandRaiseCategory = ({
   livestream,
   selectedState,
   setHandRaiseActive,
}) => {
   const [handRaiseState, updateHandRaiseRequest] = useHandRaiseState();

   useEffect(() => {
      const hasNotRaisedHandYet = handRaiseState === null;
      if (hasNotRaisedHandYet && livestream?.handRaiseActive) {
         requestHandRaise();
      }
   }, [livestream?.handRaiseActive, handRaiseState]);

   useEffect(() => {
      if (
         livestream.handRaiseActive &&
         handRaiseState &&
         ["connecting", "connected"].includes(handRaiseState.state)
      ) {
         setHandRaiseActive(true);
      } else {
         setHandRaiseActive(false);
      }
   }, [handRaiseState]);

   const requestHandRaise = () => {
      return updateHandRaiseRequest("requested");
   };
   const unRequestHandRaise = () => {
      return updateHandRaiseRequest("requested");
   };
   const startConnectingHandRaise = () => {
      return updateHandRaiseRequest("connecting");
   };

   if (!livestream.handRaiseActive || !livestream.hasStarted) {
      return <HandRaiseInactive selectedState={selectedState} />;
   }

   return (
      <>
         <HandRaisePriorRequest
            handRaiseState={handRaiseState}
            updateHandRaiseRequest={updateHandRaiseRequest}
            handRaiseActive={livestream.handRaiseActive}
         />
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
            handRaiseActive={livestream.handRaiseActive}
         />
         <HandRaiseConnected
            handRaiseState={handRaiseState}
            updateHandRaiseRequest={updateHandRaiseRequest}
            handRaiseActive={livestream.handRaiseActive}
         />
         <HandRaiseJoinDialog
            open={handRaiseState?.state === "invited"}
            onClose={unRequestHandRaise}
            startConnectingHandRaise={startConnectingHandRaise}
         />
      </>
   );
};

export default HandRaiseCategory;
