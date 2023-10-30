import { UserNotification } from "@careerfairy/shared-lib/users/userNotifications"
import BackIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import { Box, Menu, Stack, Typography } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import { Bell, Trash2 as DeleteIcon } from "react-feather"
import useIsMobile from "../../../../components/custom-hook/useIsMobile"
import { sxStyles } from "../../../../types/commonTypes"
import NotificationMenuItem from "./NotificationMenuItem"

const styles = sxStyles({
   menuWrapper: {
      top: { md: 10 },

      "& .MuiList-root": {
         p: 0,
      },
   },
   menuWrapperMobile: {
      "& .MuiPaper-root": {
         maxHeight: "unset",
         maxWidth: "unset",
         top: "0 !important",
         left: "0 !important",
         height: "100%",
         width: "100%",
         borderRadius: 0,
      },
   },
   menu: {
      width: { md: "460px" },
   },
   cardHeader: {
      display: "flex",
      borderBottom: "1px solid #DCDCDC",
      padding: 2,
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      background: "white",
      zIndex: 99,
   },
   headerTitle: {
      display: "flex",
      alignItems: "center",
   },
   noNotificationWrapper: {
      display: "flex",
      flexDirection: "column",
      my: { xs: "40%", md: 6 },
      mx: 6,
      alignItems: "center",
      textAlign: "center",
   },
   noNotificationMessage: {
      color: "#888888",
      fontSize: "16px",
   },
   deleteIcon: {
      height: "36px",
      width: "36px",

      "&:hover": {
         background: "#F3F3F3",
      },

      "& svg": {
         color: "#888888",
      },
   },
   menuContent: {
      display: "flex",
      maxHeight: { xs: "100%", md: "520px" },
   },
   bellIcon: {
      "& svg": {
         color: "#9999B1",
      },
   },
})

type Props = {
   anchorEl: HTMLElement
   handleClose: () => void
   notifications: UserNotification[]
   handleDeleteNotifications: () => void
   handleClick: (notificationId: string) => void
}
const NotificationsMenu = ({
   anchorEl,
   handleClose,
   handleClick,
   notifications,
   handleDeleteNotifications,
}: Props) => {
   const isMobile = useIsMobile()

   return (
      <Menu
         anchorEl={anchorEl}
         id="user-notifications-menu"
         open={Boolean(anchorEl)}
         onClose={handleClose}
         transformOrigin={transformOrigin}
         anchorOrigin={anchorOrigin}
         disableScrollLock={!isMobile}
         marginThreshold={0}
         sx={[styles.menuWrapper, isMobile ? styles.menuWrapperMobile : null]}
      >
         <Box sx={styles.menu}>
            <Box sx={styles.cardHeader}>
               <Box sx={styles.headerTitle}>
                  {isMobile ? (
                     <IconButton onClick={handleClose} color={"inherit"}>
                        <BackIcon fontSize={"small"} />
                     </IconButton>
                  ) : null}
                  <Typography variant={"h6"} fontWeight={"bold"}>
                     Notifications
                  </Typography>
               </Box>

               <IconButton
                  onClick={handleDeleteNotifications}
                  color={"info"}
                  sx={styles.deleteIcon}
               >
                  <DeleteIcon />
               </IconButton>
            </Box>
            <Stack sx={styles.menuContent}>
               {notifications.length ? (
                  notifications.map((notification) => (
                     <NotificationMenuItem
                        key={notification.id}
                        notification={notification}
                        handleClick={handleClick}
                     />
                  ))
               ) : (
                  <Stack spacing={2} sx={styles.noNotificationWrapper}>
                     <Box sx={styles.bellIcon}>
                        <Bell size={100} />
                     </Box>

                     <Typography variant={"h5"} fontWeight={"bold"}>
                        No notifications
                     </Typography>
                     <Typography
                        variant={"subtitle1"}
                        sx={styles.noNotificationMessage}
                     >
                        Follow your favourite companies and register for live
                        streams to start receiving updates here.
                     </Typography>
                  </Stack>
               )}
            </Stack>
         </Box>
      </Menu>
   )
}

const transformOrigin = { horizontal: "right", vertical: "top" } as const
const anchorOrigin = { horizontal: "right", vertical: "bottom" } as const

export default NotificationsMenu
