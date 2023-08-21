import { Box, Stack } from "@mui/material"
import { FC } from "react"
import Heading from "../common/Heading"
import SparksCarousel from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import SparksCarouselSkeleton from "components/views/admin/sparks/general-sparks-view/SparksCarouselSkeleton"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useSparks from "components/custom-hook/spark/useSparks"
import { useMountedState } from "react-use"

type Props = {
   handleSparksClicked: (spark: Spark) => Promise<boolean>
}

const SparksCarouselWithSuspenseComponent: FC<Props> = ({
   handleSparksClicked,
}) => {
   const isBrowser = useMountedState()
   return isBrowser() ? (
      <SuspenseWithBoundary fallback={<SparksCarouselSkeleton numSlides={8} />}>
         <Component handleSparksClicked={handleSparksClicked} />
      </SuspenseWithBoundary>
   ) : (
      <SparksCarouselSkeleton numSlides={8} />
   )
}

const Component: FC<Props> = ({ handleSparksClicked }) => {
   const { data: sparksContent } = useSparks(8)
   return (
      <Box sx={{ px: 2 }}>
         <Stack direction={"column"} sx={{ gap: "10px" }}>
            <Heading sx={{ textTransform: "uppercase" }}>Sparks</Heading>
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
