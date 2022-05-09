import React from "react"
import { Badge, IconButton, Tooltip } from "@mui/material"
import { maybePluralize } from "../../../components/helperFunctions/HelperFunctions"
import ActiveNotificationIcon from "@mui/icons-material/Notifications"
import NotificationIcon from "@mui/icons-material/NotificationsOutlined"
import Notifications from "./Notifications"

interface Props {
   notifications: any[]
   handleClick: () => any
   // anchor element for the tooltip
   notificationAnchor: HTMLAnchorElement
   handleClose: () => any
}

const NotificationsIcon = ({
   notifications,
   handleClick,
   notificationAnchor,
   handleClose,
}: Props) => {
   return (
      <>
         <Tooltip
            title={`You have ${notifications.length} unread ${maybePluralize(
               notifications.length,
               "notification"
            )}`}
         >
            <IconButton onClick={handleClick} color="primary" size="large">
               <Badge badgeContent={notifications.length} color="secondary">
                  {notificationAnchor ? (
                     <ActiveNotificationIcon />
                  ) : (
                     <NotificationIcon />
                  )}
               </Badge>
            </IconButton>
         </Tooltip>
         <Notifications
            notifications={notifications}
            handleClose={handleClose}
            anchorEl={notificationAnchor}
         />
      </>
   )
}

export default NotificationsIcon
