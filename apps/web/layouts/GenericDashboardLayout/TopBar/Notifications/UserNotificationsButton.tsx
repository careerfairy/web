import { Badge, Fab } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { UserNotification } from "@careerfairy/shared-lib/users/userNotifications"
import { MouseEvent, useMemo } from "react"
import { Bell } from "react-feather"

const styles = sxStyles({
   notificationBtn: {
      background: "unset",

      "&:hover": {
         background: "unset",
      },
      "& svg": {
         color: "#4F4F4F",
      },
   },
   badge: {
      "& .MuiBadge-dot": {
         minWidth: 12,
         height: 12,
         borderRadius: "50%",
      },
   },
})

type Props = {
   notifications: UserNotification[]
   handleClick: (event: MouseEvent<HTMLElement>) => void
}
const UserNotificationsButton = ({ notifications, handleClick }: Props) => {
   const unReadNotifications = useMemo(
      () => notifications.filter((notification) => !Boolean(notification.readAt)),
      [notifications]
   )
   return (
      <Badge
         sx={styles.badge}
         color="error"
         overlap="circular"
         invisible={unReadNotifications?.length === 0}
         badgeContent={`${unReadNotifications?.length}`}
      >
         <Fab
            onClick={handleClick}
            sx={styles.notificationBtn}
            size="small"
            aria-label="user-notifications"
         >
            <Bell fontSize={"large"} />
         </Fab>
      </Badge>
   )
}

export default UserNotificationsButton
