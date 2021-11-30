import React, { Fragment } from "react";
import StreamSnackBar from "./notification/StreamSnackBar";

function NotificationsContainer({ notifications, handRaiseMenuOpen }) {
   let streamSnackElements = notifications.map((notification, index) => {
      return (
         <StreamSnackBar
            key={index}
            handRaiseMenuOpen={handRaiseMenuOpen}
            notification={notification}
            index={index}
         />
      );
   });

   return <Fragment>{streamSnackElements}</Fragment>;
}

export default NotificationsContainer;
