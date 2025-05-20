import { Typography } from "@mui/material"
import { useLiveStreamsByIds } from "components/custom-hook/live-stream/useLiveStreamsByIds"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import CircularLoader from "components/views/loader/CircularLoader"
import EventsPreviewCarousel from "components/views/portal/events-preview/EventsPreviewCarousel"
import { LivestreamsCarouselBlockType } from "data/hygraph/types"
import { useModuleId } from "store/selectors/talentGuideSelectors"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   title: {
      fontWeight: "700",
      color: (theme) => theme.palette.neutral["800"],
   },
   subHeader: {
      fontWeight: "400",
      color: (theme) => theme.palette.neutral["800"],
      mt: 0.5,
   },
   carouselWrapper: {
      pl: "0px !important",
   },
   carouselViewport: {
      overflow: "hidden",
      // hack to ensure overflow visibility with parent padding
      padding: "12px 16px 16px 16px",
      marginX: "-16px",
   },
})

type Props = LivestreamsCarouselBlockType

export const LivestreamsCarouselBlock = (props: Props) => {
   return (
      <SuspenseWithBoundary fallback={<CircularLoader />}>
         <LivestreamsCarousel {...props} />
      </SuspenseWithBoundary>
   )
}

const LivestreamsCarousel = ({ title, subHeader, liveStreamIds }: Props) => {
   const liveStreamIdsArray = liveStreamIds.map(
      (livestream) => livestream.liveStreamId
   )

   const moduleId = useModuleId()

   const { data: liveStreams } = useLiveStreamsByIds(liveStreamIdsArray)

   return (
      <EventsPreviewCarousel
         id={"job-events"}
         location={`talent-guide-livestreams-carousel-module-${moduleId}`}
         events={liveStreams}
         styling={{
            mainWrapperBoxSx: styles.carouselWrapper,
            viewportSx: styles.carouselViewport,
         }}
         title={
            <Typography variant="brandedH4" sx={styles.title}>
               {title}
            </Typography>
         }
         subtitle={
            <Typography variant="brandedBody" sx={styles.subHeader}>
               {subHeader}
            </Typography>
         }
      />
   )
}
