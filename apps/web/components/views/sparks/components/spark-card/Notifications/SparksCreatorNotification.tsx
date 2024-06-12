import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/telemetry"
import { Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useIsMobile from "components/custom-hook/useIsMobile"
import { LINKEDIN_COLOR } from "components/util/colors"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Linkedin } from "react-feather"
import { useSelector } from "react-redux"
import {
   activeSparkSelector,
   anonymousUserCountryCodeSelector,
   progressPercentageSelector,
} from "store/selectors/sparksFeedSelectors"
import CreatorAvatar from "../../CreatorAvatar"
import { SparksPopUpBase } from "./SparksPopUpBase"

type NotificationMessageProps = {
   name: string
}

const NotificationMessage = ({ name }: NotificationMessageProps) => {
   const isMobile = useIsMobile()
   return (
      <Typography
         color={"text.primary"}
         variant={isMobile ? "body1" : "body2"}
         component={"span"}
      >
         Reach out to
         <Typography
            fontSize={"inherit"}
            color={LINKEDIN_COLOR}
            display={"inline"}
            fontWeight={600}
         >
            {" "}
            {name}{" "}
         </Typography>
         on LinkedIn and ask your own questions!
      </Typography>
   )
}

const LinkedInCta = (
   <Stack direction="row" alignItems="center" gap="12px">
      <Linkedin
         size={14}
         fill="white"
         strokeWidth={1}
         style={{ marginTop: "-2px" }}
      />
      Reach out
   </Stack>
)

type Props = {
   spark: SparkPresenter
}

export const SparksCreatorNotification = ({ spark }: Props) => {
   const { userData } = useAuth()

   const [hasUserClickedAnyButton, setHasUserClickedAnyButton] = useState(false)
   const [playingCriteriaHasBeenMet, setPlayingCriteriaHasBeenMet] =
      useState(false)
   const { trackEvent } = useSparksFeedTracker()
   const activeSpark = useSelector(activeSparkSelector)
   const percentageOfVideoPlayed = useSelector(progressPercentageSelector)
   const anonymousUserCountryCode = useSelector(
      anonymousUserCountryCodeSelector
   )

   const discoverHandleClick = useCallback(() => {
      window.open(spark.creator.linkedInUrl, "_blank")
      trackEvent(SparkEventActions.Click_ReachOut_LinkedIn)
      setHasUserClickedAnyButton(true)
   }, [spark.creator.linkedInUrl, trackEvent])

   const cancelHandleClick = useCallback((ev) => {
      setHasUserClickedAnyButton(true)
      ev.preventDefault()
      ev.stopPropagation()
   }, [])

   const userMeetsTargetCriteria = useMemo(() => {
      const userCountryCode =
         anonymousUserCountryCode || userData?.universityCountryCode

      const isTargetedUser =
         spark.group.targetedCountries?.filter(
            (country) => country.id === userCountryCode
         ).length > 0

      return isTargetedUser
   }, [
      anonymousUserCountryCode,
      spark.group.targetedCountries,
      userData?.universityCountryCode,
   ])

   useEffect(() => {
      if (
         !hasUserClickedAnyButton &&
         activeSpark &&
         activeSpark.id === spark?.id &&
         percentageOfVideoPlayed >=
            SPARK_CONSTANTS.PLAYED_PERCENTAGE_TO_SHOW_LINKEDIN_NOTIFICATION
      ) {
         setPlayingCriteriaHasBeenMet(true)
      }

      return () => setPlayingCriteriaHasBeenMet(false)
   }, [
      activeSpark,
      hasUserClickedAnyButton,
      percentageOfVideoPlayed,
      spark?.id,
   ])

   if (
      spark.creator.linkedInUrl === "" ||
      !spark.creator.linkedInUrl ||
      !userMeetsTargetCriteria
   ) {
      return null
   }

   return (
      <SparksPopUpBase
         showNotification={Boolean(
            userMeetsTargetCriteria && playingCriteriaHasBeenMet
         )}
         pictureUrl={spark.creator.avatarUrl}
         message={<NotificationMessage name={spark.creator.firstName} />}
         cancelHandleClick={cancelHandleClick}
         ctaHandleClick={discoverHandleClick}
         cta={LinkedInCta}
         ctaSx={{
            backgroundColor: `${LINKEDIN_COLOR} !important`,
         }}
         pictureSlot={<CreatorAvatar creator={spark.creator} size={50} />}
      />
   )
}
