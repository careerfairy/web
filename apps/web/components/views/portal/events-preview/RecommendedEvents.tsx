import React, { useMemo } from "react"
import { EventsCarouselStyling, EventsTypes } from "./EventsPreviewCarousel"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useRecommendedEvents from "../../../custom-hook/useRecommendedEvents"
import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import EventsPreviewCarousel from "./EventsPreviewCarousel"
import { sxStyles } from "types/commonTypes"

const slideSpacing = 21

const styles = sxStyles({
   arrowIcon: {
      padding: 0,
      minHeight: { xs: "25px", md: "30px" },
      minWidth: { xs: "25px", md: "30px" },
      ml: 2,
   },
   eventsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      pr: 2,
      pb: 0.5,
   },
   description: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 2,
   },
   seeMoreText: {
      color: "text.secondary",
      textDecoration: "underline",
      pr: 1,
   },
   underlined: {
      textDecoration: "underline",
   },
   eventTitle: {
      fontFamily: "Poppins",
      fontSize: "18px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "27px",
      color: "black",
   },
   viewport: {
      overflow: "hidden",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
   },
   slide: {
      flex: {
         xs: `0 0 90%`,
         sm: `0 0 45%`,
         md: `0 0 40%`,
         lg: `0 0 30%`,
      },
      minWidth: 0,
      position: "relative",
      height: {
         xs: 363,
         md: 363,
      },
      "&:not(:first-of-type)": {
         paddingLeft: `calc(${slideSpacing}px - 5px)`,
      },
      "&:first-of-type": {
         ml: 0.3,
      },
   },
   paddingSlide: {
      flex: `0 0 ${slideSpacing}px`,
   },
   previewContent: {
      position: "relative",
   },
   mainBox: {
      paddingLeft: 2,
   },
   titleLink: {
      color: "#000",
      "&:hover": {
         color: "#000",
      },
   },
})
const defaultStyling: EventsCarouselStyling = {
   compact: true,
   seeMoreSx: styles.seeMoreText,
   eventTitleSx: styles.eventTitle,
   viewportSx: styles.viewport,
   showArrows: true,
   headerAsLink: false,
   padding: true,
   slide: styles.slide,
   title: styles.eventTitle,
   titleVariant: "h6",
   eventsHeader: styles.eventsHeader,
   mainWrapperBoxSx: {
      mt: 2,
   },
}

const RecommendedEvents = ({ limit = 10, hideTitle }: Props) => {
   const { authenticatedUser, userData } = useAuth()

   const options = useMemo(
      () => ({
         limit,
      }),
      [limit]
   )

   const { loading, events } = useRecommendedEvents(options)

   if (!authenticatedUser?.email || !events?.length) {
      return null
   }
   return (
      <div>
         <EventsPreviewCarousel
            title={!hideTitle && "Recommended for you"}
            events={events}
            type={EventsTypes.recommended}
            loading={loading}
            isRecommended
            isAdmin={userData?.isAdmin}
            styling={defaultStyling}
         />
      </div>
   )
}

interface Props {
   limit?: FirebaseInArrayLimit
   hideTitle?: boolean
}

export default RecommendedEvents
