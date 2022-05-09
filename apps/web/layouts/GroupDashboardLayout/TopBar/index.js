import React from "react"
import GenericHeader from "../../../components/views/header/GenericHeader"
import NotificationsIcon from "./NotificationsIcon"

const TopBar = ({ notifications }) => {
   const [notificationAnchor, setNotificationAnchor] = React.useState(null)

   const handleClick = (event) => {
      setNotificationAnchor(event.currentTarget)
   }

   const handleClose = () => {
      setNotificationAnchor(null)
   }

   return (
      <GenericHeader
         endContent={
            <NotificationsIcon
               notificationAnchor={notificationAnchor}
               handleClick={handleClick}
               handleClose={handleClose}
               notifications={notifications}
            />
         }
         position={"sticky"}
      />
   )
}
export default TopBar
