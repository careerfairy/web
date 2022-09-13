import React, { Fragment, useContext } from "react"
import StreamSnackBar from "./notification/StreamSnackBar"
import NotificationsContext from "../../../../context/notifications/NotificationsContext"

function NotificationsContainer({ handRaiseMenuOpen }) {
   const { notifications } = useContext(NotificationsContext)

   let streamSnackElements = notifications.map((notification, index) => {
      return (
         <StreamSnackBar
            key={index}
            handRaiseMenuOpen={handRaiseMenuOpen}
            notification={notification}
            index={index}
         />
      )
   })

   return <Fragment>{streamSnackElements}</Fragment>
}

export default NotificationsContainer
