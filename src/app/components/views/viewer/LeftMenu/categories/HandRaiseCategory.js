import React, { useEffect, useState } from "react";
import { useFirebase } from "context/firebase";
import HandRaisePriorRequest from "./hand-raise/active/HandRaisePriorRequest";
import HandRaiseRequested from "./hand-raise/active/HandRaiseRequested";
import HandRaiseDenied from "./hand-raise/active/HandRaiseDenied";
import HandRaiseConnecting from "./hand-raise/active/HandRaiseConnecting";
import HandRaiseConnected from "./hand-raise/active/HandRaiseConnected";
import HandRaiseInactive from "./hand-raise/inactive/HandRaiseInactive";
import {
   Button,
   DialogActions,
   DialogContent,
   Typography,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import { GlassDialog } from "../../../../../materialUI/GlobalModals";
import useStreamRef from "../../../../custom-hook/useStreamRef";
import useHandRaiseState from "../../../../custom-hook/useHandRaiseState";

const HandRaiseCategory = ({
   livestream,
   selectedState,
   setHandRaiseActive,
}) => {
   const {
      createHandRaiseRequest,
      updateHandRaiseRequest: updateHandRaiseRequestFirebaseClassMethod,
   } = useFirebase();

   const theme = useTheme();
   const { authenticatedUser, userData } = useAuth();
   const handRaiseState = useHandRaiseState();
   console.log("-> handRaiseState", handRaiseState);
   const streamRef = useStreamRef();

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
         (handRaiseState.state === "connecting" ||
            handRaiseState.state === "connected")
      ) {
         setHandRaiseActive(true);
      } else {
         setHandRaiseActive(false);
      }
   }, [handRaiseState]);

   function updateHandRaiseRequest(state) {
      if (livestream.test || authenticatedUser.email) {
         let authEmail = livestream.test
            ? "streamerEmail"
            : authenticatedUser.email;
         let checkedUserData = livestream.test
            ? { firstName: "Test", lastName: "Streamer" }
            : userData;
         if (handRaiseState) {
            updateHandRaiseRequestFirebaseClassMethod(
               streamRef,
               authEmail,
               state
            );
         } else {
            createHandRaiseRequest(streamRef, authEmail, checkedUserData);
         }
      }
   }

   const requestHandRaise = () => {
      return updateHandRaiseRequest("requested");
   };
   const unRequestHandRaise = () => {
      return updateHandRaiseRequest("requested");
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
         <GlassDialog
            open={Boolean(handRaiseState && handRaiseState.state === "invited")}
         >
            <DialogContent>
               <Typography
                  align="center"
                  style={{
                     fontFamily: "Permanent Marker",
                     fontSize: "2em",
                     color: theme.palette.primary.main,
                  }}
               >
                  You've been invited to join the stream!
               </Typography>
            </DialogContent>
            <DialogActions>
               <Button
                  children="Cancel"
                  onClick={() => updateHandRaiseRequest("unrequested")}
               />
               <Button
                  variant="contained"
                  children="Join now"
                  color="primary"
                  onClick={() => updateHandRaiseRequest("connecting")}
               />
            </DialogActions>
         </GlassDialog>
      </>
   );
};

export default HandRaiseCategory;
