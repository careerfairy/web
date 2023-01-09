import React from "react"
import { Badge, Fab } from "@mui/material"
import { sxStyles } from "../../types/commonTypes"
import useMenuState from "../../components/custom-hook/useMenuState"
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded"
import { notificationsSelector } from "../../store/selectors/groupDashboardSelectors"
import { useSelector } from "react-redux"
import Notifications from "../GroupDashboardLayout/TopBar/Notifications"

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
         <Notifications
            anchorEl={anchorEl}
            notifications={notifications}
            handleClose={handleClose}
         />
      </>
   )
}

export default NotificationsButton
