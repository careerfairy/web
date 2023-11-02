import { Badge, Fab, Tooltip } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { UserNotification } from "@careerfairy/shared-lib/users/userNotifications"
import { MouseEvent, useMemo } from "react"
import { Bell } from "react-feather"
import useScrollTrigger from "@mui/material/useScrollTrigger"
import { useGenericDashboard } from "../../index"

const useStyles = () => {
   const { headerScrollThreshold, isPortalPage } = useGenericDashboard()

   const isOutsideBanner = useScrollTrigger({
      disableHysteresis: true,
      threshold: headerScrollThreshold,
   })

   const isOnPortalBanner = !isOutsideBanner && isPortalPage

   return useMemo(
      () =>
         sxStyles({
            notificationBtn: {
               background: "unset",

               "&:hover": {
                  background: "unset",
               },
               "& svg": {
                  color: isOnPortalBanner ? "white" : "#4F4F4F",
               },
            },
            notificationBtnFilled: {
               "& svg": {
                  fill: isOnPortalBanner ? "white" : "#4F4F4F",
               },
            },
            badge: {
               "& .MuiBadge-dot": {
                  minWidth: 12,
                  height: 12,
                  borderRadius: "50%",
               },
            },
         }),
      [isOnPortalBanner]
   )
}
type Props = {
   notifications: UserNotification[]
   handleClick: (event: MouseEvent<HTMLElement>) => void
   anchorEl: HTMLElement
}
const UserNotificationsButton = ({
   notifications,
   handleClick,
   anchorEl,
}: Props) => {
   const styles = useStyles()

   const unReadNotifications = useMemo(
      () =>
         notifications.filter((notification) => !Boolean(notification.readAt)),
      [notifications]
   )

   return (
      <Tooltip title="Notifications">
         <Badge
            sx={styles.badge}
            color="error"
            overlap="circular"
            invisible={unReadNotifications?.length === 0}
            badgeContent={`${unReadNotifications?.length}`}
         >
            <Fab
               onClick={handleClick}
               sx={[
                  styles.notificationBtn,
                  Boolean(anchorEl) ? styles.notificationBtnFilled : null,
               ]}
               size="small"
               aria-label="user-notifications"
            >
               <Bell fontSize={"large"} />
            </Fab>
         </Badge>
      </Tooltip>
   )
}

export default UserNotificationsButton
