// material-ui
import { Badge, IconButton } from "@mui/material"
import Tooltip from "@mui/material/Tooltip"
import { Bell } from "react-feather"

// project imports
import useMenuState from "../../../components/custom-hook/useMenuState"
import { maybePluralize } from "../../../components/helperFunctions/HelperFunctions"
import { sxStyles } from "../../../types/commonTypes"
import Notifications from "./Notifications"

const styles = sxStyles({
   root: {
      borderRadius: 6,
   },
   notificationBtn: {
      "& svg": {
         color: "neutral.800",
      },
   },
   badge: {
      "& .MuiBadge-dot": {
         minWidth: 12,
         height: 12,
         borderRadius: "50%",
      },
   },
   ava: {
      width: 50,
      height: 50,
      lineHeight: 0,
   },
})

const notifications = []

const NotificationsButton = () => {
   const { handleClick, handleClose, anchorEl } = useMenuState()

   return (
      <>
         <Tooltip
            title={`You have ${notifications.length} unread ${maybePluralize(
               notifications.length,
               "notification"
            )}`}
         >
            <Badge
               sx={styles.badge}
               color="secondary"
               variant="dot"
               overlap="circular"
               invisible={notifications.length < 1}
               badgeContent=" "
            >
               <IconButton
                  onClick={handleClick}
                  sx={styles.notificationBtn}
                  size="small"
                  aria-label="expand"
               >
                  <Bell size={24} />
               </IconButton>
            </Badge>
         </Tooltip>
         <Notifications
            anchorEl={anchorEl}
            notifications={notifications}
            handleClose={handleClose}
         />
      </>
   )
}

export default NotificationsButton
