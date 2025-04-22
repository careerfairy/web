import { useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback } from "react"
import DateUtil from "util/DateUtil"
import { LivestreamEvent } from "../../../../../../../packages/shared-lib/src/livestreams/livestreams"
import { GetNotifiedCardPresentation } from "./GetNotifiedCardPresentation"

/** Props for the container component that handles business logic */
type Props = {
   /** The livestream event data */
   livestream?: LivestreamEvent
   /** If true, shows only calendar button. If false, shows download app and calendar buttons */
   isAppDownloaded?: boolean
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
   isAppDownloaded = false,
   responsiveMode = "auto",
   isExpanded = false,
   onClose,
}: Props) => {
   const { authenticatedUser } = useAuth()
   const theme = useTheme()
   const mdUp = useMediaQuery(theme.breakpoints.up("md"))

   // Determine if using desktop layout based on responsiveMode and media query
   const isDesktop =
      responsiveMode === "auto"
         ? mdUp
         : responsiveMode === "desktop"
         ? true
         : false

   // Format livestream data for UI, with fallbacks
   const companyName = livestream?.company || "EY (Ernst & Young)"
   const companyLogoUrl =
      livestream?.companyLogoUrl || "https://placehold.co/80x80"
   const jobTitle = livestream?.title || "Technology Consulting @EY"
   const bannerImageUrl =
      livestream?.backgroundImageUrl || "https://placehold.co/600x400"

   // Format date string from livestream start time
   const eventDateString = formatLivestreamDate(livestream?.start || new Date())

   // QR code URL - in a real implementation, you might generate this dynamically
   const qrCodeUrl = "https://placehold.co/120x120"

   // Handler functions
   const handleDownloadApp = useCallback(() => {
      console.log("Download app clicked for livestream:", livestream?.id)
      // Implement actual download app logic here
   }, [livestream?.id])

   const handleAddToCalendar = useCallback(() => {
      console.log("Add to calendar clicked for livestream:", livestream?.id)
      // Implement actual calendar logic here
   }, [livestream?.id])

   return (
      <GetNotifiedCardPresentation
         companyName={companyName}
         companyLogoUrl={companyLogoUrl}
         jobTitle={jobTitle}
         bannerImageUrl={bannerImageUrl}
         eventDateString={eventDateString}
         qrCodeUrl={qrCodeUrl}
         isAppDownloaded={isAppDownloaded}
         isDesktop={isDesktop}
         isExpanded={isExpanded}
         userEmail={authenticatedUser?.email || "example@example.com"}
         onDownloadApp={handleDownloadApp}
         onAddToCalendar={handleAddToCalendar}
         onClose={onClose}
      />
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
