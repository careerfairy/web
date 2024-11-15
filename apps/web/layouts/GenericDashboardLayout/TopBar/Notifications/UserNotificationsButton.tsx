import { UserNotification } from "@careerfairy/shared-lib/users/userNotifications"
import { Badge, IconButton } from "@mui/material"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { MouseEvent, useMemo } from "react"
import { Bell } from "react-feather"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   notificationBtn: {
      background: "unset",

      "&:hover": {
         background: "unset",
      },
      "& svg": {
         color: (theme) => theme.palette.neutral[800],
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
      () => notifications.filter((notification) => !notification?.readAt),
      [notifications]
   )

   return (
      <BrandedTooltip title="Notifications">
         <Badge
            sx={styles.badge}
            color="error"
            overlap="circular"
            invisible={unReadNotifications?.length === 0}
            badgeContent={`${unReadNotifications?.length}`}
         >
            <IconButton
               onClick={handleClick}
               sx={styles.notificationBtn}
               size="small"
               aria-label="user-notifications"
            >
               <Bell fontSize={"large"} />
            </IconButton>
         </Badge>
      </BrandedTooltip>
   )
}

export default UserNotificationsButton
