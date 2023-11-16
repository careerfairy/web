import React, { memo, useContext, useEffect, useState } from "react"
import useStreamActiveHandRaises from "components/custom-hook/useStreamActiveHandRaises"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import NotificationsContext from "context/notifications/NotificationsContext"

const getId = ({ request: { id, timestamp } }) => {
   return `${id}-${timestamp?.seconds || "new"}`
}

function RequestedHandRaiseElement(props) {
   const [notificationId] = useState(getId(props))

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
         })

         return () => props.closeSnackbar(notificationId)
      }
   }, [])

   return null
}

function InvitedHandRaiseElement() {
   return null
}

function ConnectingHandRaiseElement(props) {
   const [notificationId] = useState(getId(props))

   useEffect(() => {
      props.setNewNotification({
         status: "connecting",
         id: notificationId,
         message: props.request.name + " is now connecting to the stream",
         confirmMessage: "OK",
         confirm: () => {},
         cancelMessage: "Stop Connection",
         cancel: () => props.updateHandRaiseRequest(props.request.id, "denied"),
      })

      return () => props.closeSnackbar(notificationId)
   }, [])

   return null
}

function ConnectedHandRaiseElement(props) {
   const [notificationId] = useState(getId(props))
   useEffect(() => {
      props.setNewNotification({
         status: "connected",
         id: notificationId,
         message: props.request.name + " is now connected to the stream",
         confirmMessage: "OK",
         confirm: () => {},
         cancelMessage: "Remove from Stream",
         cancel: () => props.updateHandRaiseRequest(props.request.id, "denied"),
      })

      return () => props.closeSnackbar(notificationId)
   }, [])

   return null
}

const HandRaiseNotifier = memo(({ handRaiseMenuOpen }) => {
   const { handRaises, handlers, numberOfActiveHandRaisers } =
      useStreamActiveHandRaises()

   const dispatch = useDispatch()
   const { setNewNotification } = useContext(NotificationsContext)

   const closeSnackbar = (...args) => dispatch(actions.closeSnackbar(...args))

   // useEffect(() => {
   //
   //    if(handRaiseMenuOpen && handRaises?.length) {
   //       closeAllHandRaiseSnackbars(handRaises)
   //    }
   // }, [handRaiseMenuOpen]);
   //
   //    function closeAllHandRaiseSnackbars(handRaises) {
   //       handRaises.forEach(request => closeSnackbar(getId({request})))
   //    }
   //

   return (
      <React.Fragment>
         {handRaises?.map((request) => {
            if (request.state === "requested") {
               return (
                  <RequestedHandRaiseElement
                     key={request.id}
                     closeSnackbar={closeSnackbar}
                     setNewNotification={setNewNotification}
                     updateHandRaiseRequest={handlers.updateRequest}
                     numberOfActiveHandRaisers={numberOfActiveHandRaisers}
                     request={request}
                  />
               )
            }
            if (request.state === "invited") {
               return (
                  <InvitedHandRaiseElement
                     key={request.id}
                     closeSnackbar={closeSnackbar}
                     setNewNotification={setNewNotification}
                     updateHandRaiseRequest={handlers.updateRequest}
                     numberOfActiveHandRaisers={numberOfActiveHandRaisers}
                     request={request}
                  />
               )
            }
            if (request.state === "connecting") {
               return (
                  <ConnectingHandRaiseElement
                     key={request.id}
                     closeSnackbar={closeSnackbar}
                     setNewNotification={setNewNotification}
                     updateHandRaiseRequest={handlers.updateRequest}
                     numberOfActiveHandRaisers={numberOfActiveHandRaisers}
                     request={request}
                  />
               )
            }
            if (request.state === "connected") {
               return (
                  <ConnectedHandRaiseElement
                     key={request.id}
                     closeSnackbar={closeSnackbar}
                     setNewNotification={setNewNotification}
                     updateHandRaiseRequest={handlers.updateRequest}
                     numberOfActiveHandRaisers={numberOfActiveHandRaisers}
                     request={request}
                  />
               )
            }
         })}
      </React.Fragment>
   )
})

HandRaiseNotifier.displayName = "HandRaiseNotifier"

export default HandRaiseNotifier
