import { Box, Grid, Menu, MenuItem, Stack, Typography } from "@mui/material"
import { UserNotification } from "@careerfairy/shared-lib/users/userNotifications"
import { sxStyles } from "../../../../types/commonTypes"
import { Trash2 as DeleteIcon } from "react-feather"
import IconButton from "@mui/material/IconButton"
import Image from "next/image"
import CircleIcon from "@mui/icons-material/Circle"
import BackIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import useIsMobile from "../../../../components/custom-hook/useIsMobile"
import { Bell } from "react-feather"
import DateUtil from "../../../../util/DateUtil"
import CircularLogo from "../../../../components/views/common/CircularLogo"

const styles = sxStyles({
   menuWrapper: {
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
   item: {
      display: "flex",
      flexDirection: "column",
      py: 2,
      borderBottom: "1px solid #E1E1E1",
   },
   itemContent: {
      display: "flex",
      alignItems: "center",
      minHeight: "91px",
   },
   menuContent: {
      display: "flex",
      maxHeight: { xs: "100%", md: "520px" },
   },
   itemDate: {
      display: "flex",
      alignSelf: "start",
      ml: { xs: 3.5, md: 2.5 },
   },
   imageBox: {
      display: "flex",
      justifyContent: "center",

      "& img": {
         height: 50,
      },
   },
   circle: {
      height: 10,
      width: 10,
   },
   message: {
      textWrap: "wrap",
      fontSize: "16px",
      whiteSpace: "normal",
      wordBreak: "break-word",
   },
   readItem: {
      background: "#EBEBEF",
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
                     <MenuItem
                        key={notification.id}
                        id={notification.id}
                        component="a"
                        sx={[
                           styles.item,
                           Boolean(notification.readAt) && styles.readItem,
                        ]}
                        onClick={() => handleClick(notification.id)}
                        href={notification.actionUrl}
                     >
                        <Grid container sx={styles.itemContent}>
                           <Grid xs={1} md={0.5} item>
                              {Boolean(notification.readAt) ? null : (
                                 <CircleIcon
                                    color="primary"
                                    sx={styles.circle}
                                 />
                              )}
                           </Grid>
                           <Grid
                              xs={notification.imageUrl ? 8 : 11}
                              md={notification.imageUrl ? 8.5 : 11.5}
                              item
                           >
                              <Typography
                                 variant={"subtitle1"}
                                 sx={styles.message}
                                 dangerouslySetInnerHTML={{
                                    __html: notification.message,
                                 }}
                              />
                           </Grid>
                           {notification.imageUrl ? (
                              <Grid xs={3} item>
                                 <Box sx={styles.imageBox}>
                                    {notification.imageFormat === "circular" ? (
                                       <CircularLogo
                                          src={notification.imageUrl}
                                          alt={`logo of notification, ${notification.message}`}
                                          size={70}
                                       />
                                    ) : (
                                       <Image
                                          src={notification.imageUrl}
                                          height={45}
                                          alt={`Image to notification ${notification.id}`}
                                          objectFit="contain"
                                          width={78}
                                       />
                                    )}
                                 </Box>
                              </Grid>
                           ) : null}
                        </Grid>

                        <Box sx={styles.itemDate}>
                           <Typography
                              variant={"body1"}
                              color={"text.secondary"}
                           >
                              {DateUtil.getTimeAgo(
                                 notification.createdAt.toDate()
                              )}
                           </Typography>
                        </Box>
                     </MenuItem>
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
