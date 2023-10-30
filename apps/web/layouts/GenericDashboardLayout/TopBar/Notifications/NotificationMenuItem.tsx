import { Box, Grid, MenuItem, Typography } from "@mui/material"
import { UserNotification } from "@careerfairy/shared-lib/users/userNotifications"
import { sxStyles } from "../../../../types/commonTypes"
import { Circle as CircleIcon } from "@mui/icons-material"
import Image from "next/image"
import CircularLogo from "../../../../components/views/common/CircularLogo"
import SanitizedHTML from "components/util/SanitizedHTML"
import Link from "components/views/common/Link"
import DateUtil from "../../../../util/DateUtil"

const styles = sxStyles({
   item: {
      display: "flex",
      flexDirection: "column",
      py: 2,
      borderBottom: "1px solid #E1E1E1",
   },
   readItem: {
      background: "#EBEBEF",
   },
   itemContent: {
      display: "flex",
      alignItems: "center",
      minHeight: "91px",
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
   imageBox: {
      display: "flex",
      justifyContent: "center",

      "& img": {
         height: 50,
      },
   },
})

type Props = {
   notification: UserNotification
   handleClick: (notificationId: string) => void
}

const NotificationMenuItem = ({ notification, handleClick }: Props) => {
   return (
      <MenuItem
         key={notification.id}
         id={notification.id}
         component={Link}
         sx={[styles.item, Boolean(notification.readAt) && styles.readItem]}
         onClick={() => handleClick(notification.id)}
         href={notification.actionUrl}
      >
         <Grid container sx={styles.itemContent}>
            <Grid xs={1} md={0.5} item>
               {Boolean(notification.readAt) ? null : (
                  <CircleIcon color="primary" sx={styles.circle} />
               )}
            </Grid>
            <Grid item {...getGridItemProps(notification)}>
               <Typography variant={"subtitle1"} sx={styles.message}>
                  <SanitizedHTML htmlString={notification.message} />
               </Typography>
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
         <Grid container>
            <Grid item xs={1} md={0.5} />
            <Grid item {...getGridItemProps(notification)}>
               <Typography variant={"body1"} color={"text.secondary"}>
                  {DateUtil.getTimeAgo(notification.createdAt.toDate())}
               </Typography>
            </Grid>
         </Grid>
      </MenuItem>
   )
}

const getGridItemProps = (notification: UserNotification) => {
   const baseProps = notification.imageUrl ? 8 : 11
   return {
      xs: baseProps,
      md: baseProps + 0.5,
   }
}

export default NotificationMenuItem
