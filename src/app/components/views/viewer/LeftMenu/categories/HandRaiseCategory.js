import React, { useEffect, useState } from "react";
import HandRaisePriorRequest from "./hand-raise/active/HandRaisePriorRequest";
import HandRaiseRequested from "./hand-raise/active/HandRaiseRequested";
import HandRaiseDenied from "./hand-raise/active/HandRaiseDenied";
import HandRaiseConnecting from "./hand-raise/active/HandRaiseConnecting";
import HandRaiseConnected from "./hand-raise/active/HandRaiseConnected";
import HandRaiseInactive from "./hand-raise/inactive/HandRaiseInactive";
import useHandRaiseState from "../../../../custom-hook/useHandRaiseState";
import HandRaiseJoinDialog from "./hand-raise/HandRaiseJoinDialog";
import HandRaisePromptDialog from "./hand-raise/HandRaisePromptDialog";
import * as actions from "store/actions";
import { useDispatch } from "react-redux";
import HandRaiseAcquiringMedia from "./hand-raise/active/HandRaiseAcquiringMedia";

const HandRaiseCategory = ({
   streamerId,
   livestream,
   selectedState,
   setHandRaiseActive,
   isMobile,
}) => {
   const dispatch = useDispatch();
   const [handRaiseState, updateHandRaiseRequest] = useHandRaiseState(
      streamerId
   );
   const [handRaisePromptDialogOpen, setHandRaisePromptDialogOpen] = useState(
      false
   );

   useEffect(() => {
      const hasNotRaisedHandYet = Boolean(
         handRaiseState === null && livestream?.handRaiseActive && !isMobile
      );
      setHandRaisePromptDialogOpen(hasNotRaisedHandYet);
   }, [livestream?.handRaiseActive, handRaiseState, isMobile]);

   useEffect(() => {
      if (
         !isMobile &&
         livestream.hasStarted &&
         livestream.handRaiseActive &&
         handRaiseState &&
         [
            "connecting",
            "connected",
            "requested",
            "invited",
            "acquire_media",
         ].includes(handRaiseState?.state)
      ) {
         setHandRaiseActive(true);
      } else {
         setHandRaiseActive(false);
      }
   }, [
      handRaiseState?.state,
      livestream.handRaiseActive,
      livestream.hasStarted,
      isMobile,
   ]);

   const requestHandRaise = async () => {
      try {
         await updateHandRaiseRequest("requested");
         dispatch(actions.enqueueSuccessfulHandRaiseRequest());
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
   };
   const unRequestHandRaise = () => {
      return updateHandRaiseRequest("requested");
   };
   const startConnectingHandRaise = () => {
      return updateHandRaiseRequest("connecting");
   };

   const handleCloseHandRaisePromptDialog = () =>
      setHandRaisePromptDialogOpen(false);

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
         <HandRaiseAcquiringMedia
            handRaiseState={handRaiseState}
            requestHandRaise={requestHandRaise}
            unRequestHandRaise={unRequestHandRaise}
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
         <HandRaisePromptDialog
            requestHandRaise={requestHandRaise}
            onClose={handleCloseHandRaisePromptDialog}
            open={handRaisePromptDialogOpen}
         />
      </>
   );
};

export default HandRaiseCategory;
