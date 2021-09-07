import React, { useEffect, useState } from "react";
import { withFirebase } from "context/firebase";
import HandRaisePriorRequest from "./hand-raise/active/HandRaisePriorRequest";
import HandRaiseRequested from "./hand-raise/active/HandRaiseRequested";
import HandRaiseDenied from "./hand-raise/active/HandRaiseDenied";
import HandRaiseConnecting from "./hand-raise/active/HandRaiseConnecting";
import HandRaiseConnected from "./hand-raise/active/HandRaiseConnected";
import HandRaiseInactive from "./hand-raise/inactive/HandRaiseInactive";
import {
   Button,
   Typography,
   DialogActions,
   DialogContent,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import { GlassDialog } from "../../../../../materialUI/GlobalModals";
import useStreamRef from "../../../../custom-hook/useStreamRef";

function HandRaiseCategory(props) {
   const theme = useTheme();
   const { authenticatedUser, userData } = useAuth();
   const [handRaiseState, setHandRaiseState] = useState(null);
   const streamRef = useStreamRef();

   useEffect(() => {
      if (props.livestream.test || authenticatedUser) {
         let authEmail = props.livestream.test
            ? "streamerEmail"
            : authenticatedUser.email;
         if (props.livestream && authEmail) {
            props.firebase.listenToHandRaiseState(
               streamRef,
               authEmail,
               (querySnapshot) => {
                  if (querySnapshot.exists) {
                     let request = querySnapshot.data();
                     setHandRaiseState(request);
                  }
               }
            );
         }
      }
   }, [props.livestream, authenticatedUser]);

   useEffect(() => {
      if (
         props.livestream.handRaiseActive &&
         handRaiseState &&
         (handRaiseState.state === "connecting" ||
            handRaiseState.state === "connected")
      ) {
         props.setHandRaiseActive(true);
      } else {
         props.setHandRaiseActive(false);
      }
   }, [handRaiseState]);

   function updateHandRaiseRequest(state) {
      if (props.livestream.test || authenticatedUser.email) {
         let authEmail = props.livestream.test
            ? "streamerEmail"
            : authenticatedUser.email;
         let checkedUserData = props.livestream.test
            ? { firstName: "Test", lastName: "Streamer" }
            : userData;
         if (handRaiseState) {
            props.firebase.updateHandRaiseRequest(streamRef, authEmail, state);
         } else {
            props.firebase.createHandRaiseRequest(
               streamRef,
               authEmail,
               checkedUserData
            );
         }
      }
   }

   if (!props.livestream.handRaiseActive) {
      return <HandRaiseInactive selectedState={props.selectedState} />;
   }

   return (
      <>
         <HandRaisePriorRequest
            handRaiseState={handRaiseState}
            updateHandRaiseRequest={updateHandRaiseRequest}
         />
         <HandRaiseRequested
            handRaiseState={handRaiseState}
            updateHandRaiseRequest={updateHandRaiseRequest}
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
}

export default withFirebase(HandRaiseCategory);
