import SparksCarouselWithSuspenseComponent from "components/views/portal/sparks/SparksCarouselWithSuspenseComponent"
import { FC, useCallback } from "react"
import { SectionAnchor, useCompanyPage, TabValue } from ".."
import { useMountedState } from "react-use"
import { useRouter } from "next/router"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Box, Typography } from "@mui/material"
import { useDispatch } from "react-redux"
import {
   setCameFromCompanyPageLink,
   setInteractionSource,
} from "store/reducers/sparksFeedReducer"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"

type Props = {
   groupId: string
}

const SparksSection: FC<Props> = ({ groupId }) => {
   const dispatch = useDispatch()
   const isMobile = useIsMobile()

   const {
      group,
      sectionRefs: { eventSectionRef },
   } = useCompanyPage()
   const isMounted = useMountedState()
   const router = useRouter()

   const handleSparksClicked = useCallback(
      (spark: Spark) => {
         if (spark) {
            dispatch(setInteractionSource(SparkInteractionSources.Company_Page))
            dispatch(setCameFromCompanyPageLink(router.asPath))
            router.push({
               pathname: `/sparks/${spark.id}`,
               query: {
                  ...router.query, // spread current query params
                  groupId: group.id,
               },
            })
         }
         return
      },
      [dispatch, group.id, router]
   )

   return isMounted() ? (
      <Box>
         <SectionAnchor
            ref={eventSectionRef}
            tabValue={TabValue.livesStreams}
         />
         <SparksCarouselWithSuspenseComponent
            header={
               <Typography variant="h4" fontWeight={"600"} color="black">
                  Sparks
               </Typography>
            }
            groupId={groupId}
            handleSparksClicked={handleSparksClicked}
            showArrows={!isMobile}
            sx={{ pl: 0 }}
         />
      </Box>
   ) : null
}

export default SparksSection
