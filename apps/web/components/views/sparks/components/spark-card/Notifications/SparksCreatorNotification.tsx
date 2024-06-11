import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/telemetry"
import { Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { LINKEDIN_COLOR } from "components/util/colors"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { useCallback, useMemo } from "react"
import { Linkedin } from "react-feather"
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
   creator: PublicCreator
}

export const SparksCreatorNotification = ({ creator }: Props) => {
   const { trackEvent } = useSparksFeedTracker()

   const discoverHandleClick = useCallback(() => {
      window.open(creator.linkedInUrl, "_blank")
      trackEvent(SparkEventActions.Click_ReachOut_LinkedIn)
   }, [creator.linkedInUrl, trackEvent])

   const cancelHandleClick = useCallback((ev) => {
      //dispatch(removeEventNotifications())
      ev.preventDefault()
      ev.stopPropagation()
   }, [])

   const showNotification: boolean = useMemo(() => true, [])

   return (
      <SparksPopUpBase
         showNotification={showNotification}
         pictureUrl={creator.avatarUrl}
         message={<NotificationMessage name={creator.firstName} />}
         cancelHandleClick={cancelHandleClick}
         ctaHandleClick={discoverHandleClick}
         cta={LinkedInCta}
         ctaSx={{
            backgroundColor: `${LINKEDIN_COLOR} !important`,
         }}
         pictureSlot={<CreatorAvatar creator={creator} size={50} />}
      />
   )
}
