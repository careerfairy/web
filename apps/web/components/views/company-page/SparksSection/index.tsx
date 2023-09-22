import SparksCarouselWithSuspenseComponent from "components/views/portal/sparks/SparksCarouselWithSuspenseComponent"
import { FC, useCallback } from "react"
import { SectionAnchor, useCompanyPage, TabValue } from ".."
import { useMountedState } from "react-use"
import { useRouter } from "next/router"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Box, Typography } from "@mui/material"
import { useDispatch } from "react-redux"
import { setCameFromCompanyPageLink } from "store/reducers/sparksFeedReducer"

type Props = {
   groupId: String
}

const SparksSection: FC<Props> = ({ groupId }) => {
   const dispatch = useDispatch()

   const {
      group,
      sectionRefs: { eventSectionRef },
   } = useCompanyPage()
   const isMounted = useMountedState()
   const router = useRouter()

   const handleSparksClicked = useCallback(
      (spark: Spark) => {
         if (spark) {
            dispatch(setCameFromCompanyPageLink(router.asPath))
            router.push(`/sparks/${spark.id}?groupId=${group.id}`)
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
         />
      </Box>
   ) : null
}

export default SparksSection
