import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Skeleton } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useUserSparks } from "components/custom-hook/spark/useUserSparks"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import SparksCarouselSkeleton from "components/views/admin/sparks/general-sparks-view/SparksCarouselSkeleton"
import { SparksCarousel } from "components/views/sparks/components/SparksCarousel"
import { sxStyles } from "types/commonTypes"
import { EndOfStreamContainer } from "./Container"
import { Heading } from "./Heading"

const styles = sxStyles({
   root: {
      mx: "auto",
   },
   noRightPadding: {
      pr: 0,
   },
   sparkCardWrapper: {
      position: "relative",
      width: "100%",
      paddingTop: "145.23%",
      "& > *": {
         position: "absolute !important",
         top: 0,
         right: 0,
         bottom: 0,
         left: 0,
      },
   },
   skeleton: {
      width: "100%",
      height: "100%",
      borderRadius: 3,
   },
})

export const Sparks = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content />
      </SuspenseWithBoundary>
   )
}

const Content = () => {
   const sparks = useUserSparks()
   const streamIsMobile = useStreamIsMobile()

   return (
      <EndOfStreamContainer
         sx={Boolean(streamIsMobile) && styles.noRightPadding}
      >
         <SparksCarousel
            sparks={sparks}
            header={
               <Heading>Discover more interesting topics with Sparks!</Heading>
            }
            handleSparksClicked={(spark) =>
               window.open(
                  `${getBaseUrl()}/sparks/${spark.id}?interactionSource=${
                     SparkInteractionSources.Livestream_End_Screen
                  }`,
                  "_blank"
               )
            }
         />
      </EndOfStreamContainer>
   )
}

const Loader = () => {
   return (
      <EndOfStreamContainer sx={styles.noRightPadding}>
         <Heading>
            <Skeleton width={280} />
         </Heading>
         <SparksCarouselSkeleton />
      </EndOfStreamContainer>
   )
}
