import useIsMobile from "components/custom-hook/useIsMobile"
import { appQrCodeLSRegistration } from "constants/images"
import { useAuth } from "HOCs/AuthProvider"
import DateUtil from "util/DateUtil"
import { LivestreamEvent } from "../../../../../../../packages/shared-lib/src/livestreams/livestreams"
import { AddToCalendar } from "../../../common/AddToCalendar"
import { GetNotifiedCardPresentation } from "./GetNotifiedCardPresentation"

/** Props for the container component that handles business logic */
type Props = {
   /** The livestream event data */
   livestream: LivestreamEvent
   /** If true, shows only calendar button. If false, shows download app and calendar buttons */
   shouldDownloadApp: boolean
   /** Controls the responsive layout. "desktop" forces desktop layout, "mobile" forces mobile layout, "auto" uses media queries */
   responsiveMode?: "desktop" | "mobile" | "auto"
   /** If true and isDesktop is true, shows the expanded version with centered content */
   isExpanded?: boolean
   /** Optional callback when close button is clicked */
   onClose?: () => void
}

/**
 * Container component that handles business logic for the GetNotifiedCard.
 * This component processes the livestream data and passes UI-only props to the presentation component.
 */
export const GetNotifiedCard = ({
   livestream,
   shouldDownloadApp,
   responsiveMode = "auto",
   isExpanded = false,
   onClose,
}: Props) => {
   const { authenticatedUser } = useAuth()
   const isDesktopDefault = !useIsMobile()

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
         filename={`${livestream.company}-event`}
      >
         {(handleAddToCalendar) => (
            <GetNotifiedCardPresentation
               companyName={livestream.company}
               companyLogoUrl={livestream.companyLogoUrl}
               title={livestream.title}
               bannerImageUrl={livestream.backgroundImageUrl}
               eventDateString={formatLivestreamDate(
                  livestream?.start || new Date()
               )}
               qrCodeUrl={appQrCodeLSRegistration}
               shouldDownloadApp={shouldDownloadApp}
               isDesktop={isDesktop}
               isExpanded={isExpanded}
               userEmail={authenticatedUser?.email || "example@example.com"}
               onAddToCalendar={handleAddToCalendar}
               onClose={onClose}
               downloadAppHref={
                  "/install-mobile-application?utm_source=careerfairy&utm_campaign=AppDownloadQ12025&utm_medium=lsregistrationbutton&utm_content=appdownload"
               }
            />
         )}
      </AddToCalendar>
   )
}

// Helper function to format date from firebase timestamp
const formatLivestreamDate = (timestamp: any): string => {
   if (!timestamp) return ""

   try {
      // Convert Firebase timestamp to JS Date
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return DateUtil.formatDateTime(date)
   } catch (error) {
      console.error("Error formatting date:", error)
      return ""
   }
}
