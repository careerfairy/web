import SparksCarouselWithSuspenseComponent from "components/views/portal/sparks/SparksCarouselWithSuspenseComponent"
import { FC } from "react"
import { SectionAnchor, useCompanyPage, TabValue } from ".."
import { useMountedState } from "react-use"
import { useRouter } from "next/router"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Box, Typography } from "@mui/material"

type Props = {
   groupId: String
}

const SparksSection: FC<Props> = ({ groupId }) => {
   const {
      group,
      upcomingLivestreams,
      pastLivestreams,
      sectionRefs: { eventSectionRef },
   } = useCompanyPage()
   const isMounted = useMountedState()
   const router = useRouter()

   const handleSparksClicked = async (spark: Spark) => {
      if (!spark) return
      router.push(`/sparks/${spark.id}`)
      return
   }

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
