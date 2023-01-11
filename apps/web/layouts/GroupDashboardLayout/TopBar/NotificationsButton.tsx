import { useSelector } from "react-redux"

// material-ui
import { Badge, Fab } from "@mui/material"
import Tooltip from "@mui/material/Tooltip"
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded"

// project imports
import Notifications from "./Notifications"
import useMenuState from "../../../components/custom-hook/useMenuState"
import { notificationsSelector } from "../../../store/selectors/groupDashboardSelectors"
import { maybePluralize } from "../../../components/helperFunctions/HelperFunctions"
import { sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
   root: {
      borderRadius: 6,
   },
   notificationBtn: {
      zIndex: 0,
      color: "text.primary",
      backgroundColor: "background.paper",
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
const NotificationsButton = () => {
   const { handleClick, handleClose, anchorEl } = useMenuState()

   const notifications = useSelector(notificationsSelector)

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
               <Fab
                  onClick={handleClick}
                  sx={styles.notificationBtn}
                  size="small"
                  aria-label="expand"
               >
                  <NotificationsNoneRoundedIcon fontSize={"large"} />
               </Fab>
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
