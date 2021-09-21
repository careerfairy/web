import React, { useEffect, useState } from "react";

const getId = ({ request: { id, timestamp } }) => {
   return `${id}-${timestamp.seconds}`;
};

function RequestedHandRaiseElement(props) {
   const [notificationId] = useState(getId(props));

   useEffect(() => {
      if (props.numberOfActiveHandRaisers < 8) {
         props.setNewNotification({
            status: "requested",
            id: notificationId,
            message:
               props.request.name +
               " has raised a hand and requested to join the stream",
            confirmMessage: "Invite",
            confirm: () =>
               props.updateHandRaiseRequest(props.request.id, "invited"),
            cancelMessage: "Deny",
            cancel: () =>
               props.updateHandRaiseRequest(props.request.id, "denied"),
         });

         return () => props.closeSnackbar(notificationId);
      }
   }, []);

   return null;
}

function InvitedHandRaiseElement() {
   return null;
}

function ConnectingHandRaiseElement(props) {
   const [notificationId] = useState(getId(props));

   useEffect(() => {
      props.setNewNotification({
         status: "connecting",
         id: notificationId,
         message: props.request.name + " is now connecting to the stream",
         confirmMessage: "OK",
         confirm: () => {},
         cancelMessage: "Stop Connection",
         cancel: () => props.updateHandRaiseRequest(props.request.id, "denied"),
      });

      return () => props.closeSnackbar(notificationId);
   }, []);

   return null;
}

function ConnectedHandRaiseElement(props) {
   const [notificationId] = useState(getId(props));
   useEffect(() => {
      props.setNewNotification({
         status: "connected",
         id: notificationId,
         message: props.request.name + " is now connected to the stream",
         confirmMessage: "OK",
         confirm: () => {},
         cancelMessage: "Remove from Stream",
         cancel: () => props.updateHandRaiseRequest(props.request.id, "denied"),
      });

      return () => props.closeSnackbar(notificationId);
   }, []);

   return null;
}

function HandRaiseNotifier({ handRaises, ...props }) {
   return (
      <React.Fragment>
         {handRaises.map((request) => {
            if (request.state === "requested") {
               return (
                  <RequestedHandRaiseElement key={request.id} request={request} {...props} />
               );
            }
            if (request.state === "invited") {
               return <InvitedHandRaiseElement key={request.id} request={request} {...props} />;
            }
            if (request.state === "connecting") {
               return (
                  <ConnectingHandRaiseElement key={request.id} request={request} {...props} />
               );
            }
            if (request.state === "connected") {
               return (
                  <ConnectedHandRaiseElement key={request.id} request={request} {...props} />
               );
            }
         })}
      </React.Fragment>
   );
}

export default HandRaiseNotifier;
