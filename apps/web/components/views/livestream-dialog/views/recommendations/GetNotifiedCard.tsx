import { userIsTargetedApp } from "@careerfairy/shared-lib/countries/filters"
import useIsMobile from "components/custom-hook/useIsMobile"
import { appQrCodeLSRegistration } from "constants/images"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"
import { MobileUtils } from "util/mobile.utils"
import { useLiveStreamDialog } from "../.."
import { LivestreamEvent } from "../../../../../../../packages/shared-lib/src/livestreams/livestreams"
import { AddToCalendar } from "../../../common/AddToCalendar"
import {
   CardProps,
   GetNotifiedCardPresentation,
} from "./GetNotifiedCardPresentation"

/** Props for the container component that handles business logic */
type Props = {
   /** The livestream event data */
   livestream: LivestreamEvent
   /** The registered livestreams, in the case of multi-registration flow (e.g. panels) */
   registeredLivestreams?: LivestreamEvent[]
   /** Controls the responsive layout. "desktop" forces desktop layout, "mobile" forces mobile layout, "auto" uses media queries */
   responsiveMode?: "desktop" | "mobile" | "auto"
   /** If true and isDesktop is true, shows the expanded version with centered content */
   isExpanded?: boolean
   /** Optional callback when close button is clicked */
   onClose?: () => void
   /** If true, animate layout */
   animateLayout?: boolean
} & CardProps

/**
 * Container component that handles business logic for the GetNotifiedCard.
 * This component processes the livestream data and passes UI-only props to the presentation component.
 */
export const GetNotifiedCard = ({
   livestream,
   registeredLivestreams,
   responsiveMode = "auto",
   isExpanded = false,
   onClose,
   animateLayout,
   ...cardProps
}: Props) => {
   const { authenticatedUser, userData } = useAuth()
   const isDesktopDefault = !useIsMobile()
   const { originSource } = useLiveStreamDialog()

   const shouldDownloadApp = useMemo(() => {
      return userIsTargetedApp(userData) && !MobileUtils.webViewPresence()
   }, [userData])

   // Determine if using desktop layout based on responsiveMode and media query
   const isDesktop =
      responsiveMode === "auto"
         ? isDesktopDefault
         : responsiveMode === "desktop"
         ? true
         : false

   return (
      <AddToCalendar
         event={livestream}
         events={registeredLivestreams}
         filename={`${livestream.company}-event`}
         originSource={originSource}
      >
         {(handleAddToCalendar) => (
            <GetNotifiedCardPresentation
               {...cardProps}
               registeredLivestreams={registeredLivestreams}
               companyName={livestream.company}
               companyLogoUrl={livestream.companyLogoUrl}
               title={livestream.title}
               bannerImageUrl={livestream.backgroundImageUrl}
               eventDate={livestream?.start || new Date()}
               qrCodeUrl={appQrCodeLSRegistration}
               shouldDownloadApp={shouldDownloadApp}
               isDesktop={isDesktop}
               isExpanded={isExpanded}
               userEmail={authenticatedUser?.email}
               onAddToCalendar={handleAddToCalendar}
               onClose={onClose}
               downloadAppHref={
                  "https://careerfairy.app.link/CFAppDownloadPage"
               }
               animateLayout={animateLayout}
            />
         )}
      </AddToCalendar>
   )
}
