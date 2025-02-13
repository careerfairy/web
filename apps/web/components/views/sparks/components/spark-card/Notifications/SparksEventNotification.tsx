import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/telemetry"
import { Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { companyLogoPlaceholder } from "constants/images"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   removeEventNotifications,
   setEventToRegisterTo,
   showEventDetailsDialog,
} from "../../../../../../store/reducers/sparksFeedReducer"
import { currentSparkEventNotificationSelector } from "../../../../../../store/selectors/sparksFeedSelectors"
import DateUtil from "../../../../../../util/DateUtil"
import { SparksPopUpBase } from "./SparksPopUpBase"
import { useHasEventNotification } from "./useHasEventNotification"

type Props = {
   spark: SparkPresenter
}
export const SparksEventNotification = ({ spark }: Props) => {
   const isMobile = useIsMobile()
   const dispatch = useDispatch()
   const { trackEvent } = useSparksFeedTracker()

   const eventNotification = useSelector(currentSparkEventNotificationSelector)

   const hasNotification = useHasEventNotification(spark)

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
      dispatch(setEventToRegisterTo(eventNotification?.eventId))
      dispatch(showEventDetailsDialog(true))
      trackEvent(SparkEventActions.Click_DiscoverLivestreamCTA, {
         livestreamId: eventNotification?.eventId,
      })
   }, [dispatch, eventNotification?.eventId, trackEvent])

   const cancelHandleClick = useCallback(
      (ev) => {
         dispatch(removeEventNotifications())
         ev.preventDefault()
         ev.stopPropagation()
      },
      [dispatch]
   )

   return (
      <SparksPopUpBase
         showNotification={hasNotification}
         pictureUrl={logoUrl || companyLogoPlaceholder}
         message={
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
               has a live stream happening in {missingDays} days! Check now!
            </Typography>
         }
         cancelHandleClick={cancelHandleClick}
         ctaHandleClick={discoverHandleClick}
         cta="Discover now"
      />
   )
}
