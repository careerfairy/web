import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Box, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useIsMounted } from "components/custom-hook/utils/useIsMounted"
import { FallbackComponent } from "components/views/portal/sparks/FallbackComponent"
import { GroupSparksCarousel } from "components/views/portal/sparks/SparksCarouselWithArrows"
import { useRouter } from "next/router"
import { FC, useCallback } from "react"
import { useDispatch } from "react-redux"
import { setCameFromCompanyPageLink } from "store/reducers/sparksFeedReducer"
import { SectionAnchor, TabValue, useCompanyPage } from ".."

type Props = {
   groupId: string
}

const CarouselHeader = () => {
   return (
      <Typography variant="h4" fontWeight={"600"} color="black">
         Sparks
      </Typography>
   )
}

const Loader = () => {
   return <FallbackComponent header={<CarouselHeader />} />
}

const SparksSection: FC<Props> = ({ groupId }) => {
   const dispatch = useDispatch()
   const isMobile = useIsMobile()

   const {
      group,
      sectionRefs: { eventSectionRef },
   } = useCompanyPage()
   const router = useRouter()
   const isMounted = useIsMounted()

   const handleSparksClicked = useCallback(
      (spark: Spark) => {
         if (spark) {
            dispatch(setCameFromCompanyPageLink(router.asPath))
            router.push({
               pathname: `/sparks/${spark.id}`,
               query: {
                  ...router.query, // spread current query params
                  groupId: group.id,
                  interactionSource: SparkInteractionSources.Company_Page,
               },
            })
         }
         return
      },
      [dispatch, group.id, router]
   )

   return (
      <Box>
         <SectionAnchor
            ref={eventSectionRef}
            tabValue={TabValue.livesStreams}
         />
         {isMounted ? (
            <SuspenseWithBoundary fallback={<Loader />}>
               <GroupSparksCarousel
                  header={<CarouselHeader />}
                  groupId={groupId}
                  handleSparksClicked={handleSparksClicked}
                  showArrows={!isMobile}
                  sx={{ pl: 0 }}
               />
            </SuspenseWithBoundary>
         ) : (
            <Loader />
         )}
      </Box>
   )
}

export default SparksSection
