import { Box, Stack } from "@mui/material"
import { FC, useEffect, useState } from "react"
import Heading from "../common/Heading"
import SparksCarousel from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import SparksCarouselSkeleton from "components/views/admin/sparks/general-sparks-view/SparksCarouselSkeleton"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useSparks from "components/custom-hook/spark/useSparks"

const HEADING_TEXT = "Sparks"

type Props = {
   groupId?: String
   handleSparksClicked: (spark: Spark) => Promise<void>
}

const SparksCarouselWithSuspenseComponent: FC<Props> = ({
   groupId,
   handleSparksClicked,
}) => {
   const [isClient, setIsClient] = useState(false)
   useEffect(() => {
      // The useEffect hook only runs on the client
      setIsClient(true)
   }, [])

   return isClient ? (
      <SuspenseWithBoundary fallback={<FallbackComponent />}>
         <Component handleSparksClicked={handleSparksClicked} />
      </SuspenseWithBoundary>
   ) : (
      <SparksCarouselSkeleton numSlides={8} />
   )
}

const FallbackComponent: FC = () => {
   return (
      <Box sx={{ pl: 2 }}>
         <Stack direction={"column"} sx={{ gap: "10px" }}>
            <Heading sx={{ textTransform: "uppercase" }}>
               {HEADING_TEXT}
            </Heading>
            <SparksCarouselSkeleton numSlides={8} />
         </Stack>
      </Box>
   )
}

const Component: FC<Props> = ({ groupId, handleSparksClicked }) => {
   const { data: sparksContent } = useSparks(8, groupId)
   return (
      <Box sx={{ pl: 2 }}>
         <Stack spacing={1.25}>
            <Heading sx={{ textTransform: "uppercase" }}>
               {HEADING_TEXT}
            </Heading>
            <SparksCarousel
               sparks={sparksContent}
               onSparkClick={handleSparksClicked}
               isAdmin={false}
            />
         </Stack>
      </Box>
   )
}

export default SparksCarouselWithSuspenseComponent
