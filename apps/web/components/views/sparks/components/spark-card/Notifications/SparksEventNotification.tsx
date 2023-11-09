import React, { FC, useCallback, useMemo } from "react"
import DateUtil from "../../../../../../util/DateUtil"
import { useDispatch, useSelector } from "react-redux"
import {
   activeSparkSelector,
   currentSparkEventNotificationSelector,
   groupIdSelector,
} from "../../../../../../store/selectors/sparksFeedSelectors"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import {
   removeCurrentEventNotifications,
   showEventDetailsDialog,
} from "../../../../../../store/reducers/sparksFeedReducer"
import { Box, Button, Slide, Typography } from "@mui/material"
import { companyLogoPlaceholder } from "../../../../../../constants/images"
import { sxStyles } from "../../../../../../types/commonTypes"
import CircularLogo from "components/views/common/logos/CircularLogo"

const styles = sxStyles({
   root: {
      zIndex: 10,
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      top: 26,
      left: 26,
      right: 26,
      borderRadius: 3.25,
      backgroundColor: "white",
      padding: 3,
   },
   notification: {
      display: "flex",
      flexDirection: "row",
      mb: 3,
   },
   avatar: {
      width: { xs: 50, md: 60 },
      height: { xs: 50, md: 60 },
   },
   message: {
      display: "flex",
      alignItems: "center",
      ml: 2,
   },
   actions: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
   },
   btn: {
      fontSize: { xs: 12, md: 14 },
      width: "48%",
      textTransform: "none",
      py: { xs: 1, md: 0.5 },
   },
   cancelBtn: {
      color: "#A5A5A5 !important",
   },
})

type Props = {
   spark: SparkPresenter
}
const SparksEventNotification: FC<Props> = ({ spark }) => {
   const dispatch = useDispatch()
   const isMobile = useIsMobile()

   const eventNotification = useSelector(currentSparkEventNotificationSelector)
   const activeSpark = useSelector(activeSparkSelector)
   const groupPageId = useSelector(groupIdSelector)

   const { universityName, logoUrl } = spark.group

   const missingDays = useMemo(
      () =>
         eventNotification
            ? Math.floor(
                 DateUtil.getDifferenceInDays(
                    new Date(),
                    eventNotification.startDate
                 )
              )
            : 0,
      [eventNotification]
   )

   const discoverHandleClick = useCallback(() => {
      dispatch(showEventDetailsDialog(true))
   }, [dispatch])

   const cancelHandleClick = useCallback(
      (ev) => {
         dispatch(removeCurrentEventNotifications())
         ev.preventDefault()
         ev.stopPropagation()
      },
      [dispatch]
   )

   const showNotification: boolean = useMemo(
      () =>
         Boolean(
            eventNotification &&
               activeSpark &&
               activeSpark.id === spark?.id &&
               !activeSpark.isCardNotification &&
               !groupPageId
         ),
      [activeSpark, eventNotification, groupPageId, spark?.id]
   )

   return (
      <Slide direction={"down"} in={showNotification}>
         <Box sx={styles.root}>
            <Box sx={styles.notification}>
               <CircularLogo
                  src={logoUrl || companyLogoPlaceholder}
                  alt="company logo live stream notification"
                  sx={styles.avatar}
               />
               <Box sx={styles.message}>
                  <Typography
                     color={"text.primary"}
                     variant={isMobile ? "body1" : "body2"}
                     component={"span"}
                  >
                     <Typography
                        fontSize={"inherit"}
                        color={"primary"}
                        display={"inline"}
                     >
                        {universityName}{" "}
                     </Typography>
                     has a live stream happening in {missingDays} days! Check
                     now!
                  </Typography>
               </Box>
            </Box>
            <Box sx={styles.actions}>
               <Button
                  sx={[styles.btn, styles.cancelBtn]}
                  onClick={cancelHandleClick}
                  variant="outlined"
                  size="small"
                  color="grey"
               >
                  Maybe later
               </Button>
               <Button
                  sx={styles.btn}
                  onClick={discoverHandleClick}
                  variant="contained"
                  size="small"
                  color="primary"
               >
                  Discover now
               </Button>
            </Box>
         </Box>
      </Slide>
   )
}

export default SparksEventNotification
