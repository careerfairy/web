import { LivestreamCTA } from "@careerfairy/shared-lib/livestreams"
import { useAppDispatch } from "components/custom-hook/store"
import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { useLivestreamActiveCTA } from "components/custom-hook/streaming/call-to-action/useLivestreamActiveCTA"
import { useUserLivestreamCTA } from "components/custom-hook/streaming/call-to-action/useUserLivestreamCTA"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"
import { livestreamService } from "data/firebase/LivestreamService"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link2 } from "react-feather"
import { ActiveViews, setActiveView } from "store/reducers/streamingAppReducer"
import { useIsRecordingWindow } from "store/selectors/streamingAppSelectors"
import { useStreamingContext } from "../../context"
import { CTASnackbarCard } from "../snackbar-notifications/CTASnackbarCard"
import {
   SnackbarNotificationType,
   useSnackbarNotifications,
} from "../snackbar-notifications/SnackbarNotificationsProvider"
import { CircularButton } from "./CircularButton"

export const CallsToActionButton = () => {
   return (
      <SuspenseWithBoundary fallback={<></>}>
         <CTAButtonComponent />
      </SuspenseWithBoundary>
   )
}

const CTAButtonComponent = () => {
   const dispatch = useAppDispatch()
   const { livestreamId, agoraUserId } = useStreamingContext()
   const isRecordingWindow = useIsRecordingWindow()
   const { notifications, removeNotification, queueNotification } =
      useSnackbarNotifications()
   const { isActive: isCTAPanelActive } = useActiveSidePanelView(
      ActiveViews.CTA
   )
   const { data: activeCTA } = useLivestreamActiveCTA(livestreamId)
   const [unreadActiveCTA, setUnreadActiveCTA] = useState<LivestreamCTA[]>([])
   const { data: userCtaInteractions } = useUserLivestreamCTA(
      livestreamId,
      agoraUserId
   )

   const ctaWithNoUserInteraction = useMemo(() => {
      if (userCtaInteractions) {
         const userInteractionsIds = userCtaInteractions.map(
            (userCTA) => userCTA.ctaId
         )
         return activeCTA.filter((cta) => !userInteractionsIds.includes(cta.id))
      } else return []
   }, [userCtaInteractions, activeCTA])

   const unreadCTAs = useMemo(
      () =>
         userCtaInteractions
            ?.filter((ctaInteraction) => !ctaInteraction.readAt)
            .map((ctaInteraction) => ctaInteraction.ctaId),
      [userCtaInteractions]
   )

   const notClickedOrDismissedCTA = useMemo(
      () =>
         userCtaInteractions
            ?.filter(
               (ctaInteraction) =>
                  !ctaInteraction.clickedAt?.length &&
                  !ctaInteraction.dismissedAt
            )
            .map((ctaInteraction) => ctaInteraction.ctaId),
      [userCtaInteractions]
   )

   const queueCTASnackbarNotifications = useCallback(
      (ctas: LivestreamCTA[]) => {
         const activeCTAIds = activeCTA.map((cta) => cta.id)
         // check for CTAs that have become inactive and remove them
         const removedCTA = notifications
            .filter(
               (notification) =>
                  notification.type == SnackbarNotificationType.CTA &&
                  !activeCTAIds.includes(notification.id)
            )
            .map((notification) => notification.id)

         removedCTA.length && removeNotification(...removedCTA)

         const newNotifications = ctas.map((cta) => ({
            id: cta.id,
            type: SnackbarNotificationType.CTA,
            notification: <CTASnackbarCard cta={cta} />,
         }))

         newNotifications.length &&
            !isRecordingWindow &&
            queueNotification(...newNotifications)
      },
      [
         activeCTA,
         notifications,
         queueNotification,
         removeNotification,
         isRecordingWindow,
      ]
   )

   useEffect(() => {
      if (userCtaInteractions) {
         const unreadActiveCTAs = activeCTA
            .filter((cta) => unreadCTAs.includes(cta.id))
            .concat(ctaWithNoUserInteraction)

         setUnreadActiveCTA(unreadActiveCTAs)

         const notClickedOrDismissedActiveCTAs = activeCTA
            .filter((cta) => notClickedOrDismissedCTA.includes(cta.id))
            .concat(ctaWithNoUserInteraction)

         queueCTASnackbarNotifications(notClickedOrDismissedActiveCTAs)
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeCTA, userCtaInteractions])

   const handleClick = async () => {
      dispatch(setActiveView(ActiveViews.CTA))
      const ctaIds = activeCTA.map((cta) => cta.id)
      livestreamService.markCTAAsRead(livestreamId, agoraUserId, ctaIds)
      setUnreadActiveCTA([])
   }

   if (!activeCTA.length) return null

   return (
      <BrandedBadge
         color="error"
         variant="branded"
         badgeContent={!isCTAPanelActive ? unreadActiveCTA?.length : null}

      >
         <CircularButton onClick={handleClick} color="primary">
            <Link2 />
         </CircularButton>
      </BrandedBadge>
   )
}
