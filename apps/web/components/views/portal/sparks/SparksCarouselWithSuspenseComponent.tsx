import { Box, IconButton, Stack } from "@mui/material"
import { FC, useCallback, useEffect, useRef, useState } from "react"
import Heading from "../common/Heading"
import SparksCarousel, {
   ChildRefType,
} from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import SparksCarouselSkeleton from "components/views/admin/sparks/general-sparks-view/SparksCarouselSkeleton"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useSparks from "components/custom-hook/spark/useSparks"
import { ArrowLeft, ArrowRight } from "@mui/icons-material"
import { sxStyles } from "types/commonTypes"

const HEADING_TEXT = "Sparks"

const styles = sxStyles({
   arrowIcon: {
      padding: 0,
      minHeight: { xs: "25px", md: "30px" },
      minWidth: { xs: "25px", md: "30px" },
      ml: 2,
   },
})

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
         <Component
            groupId={groupId}
            handleSparksClicked={handleSparksClicked}
         />
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
   const childRef = useRef<ChildRefType | null>(null)
   const [step, setStep] = useState(0)

   useEffect(() => {
      setStep(0)
   }, [sparksContent])

   const handleSteps = useCallback(
      (increment = false) => {
         if (increment) {
            setStep((prevStep) => (prevStep + 1) % sparksContent.length)
         } else {
            if (step) {
               setStep((prevStep) => prevStep - 1)
            } else {
               setStep(sparksContent.length - 1)
            }
         }
      },
      [sparksContent?.length, step]
   )

   return Boolean(sparksContent.length) ? (
      <Box sx={{ pl: 2 }}>
         <Stack spacing={1.25}>
            <Box
               sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
               }}
            >
               <Heading sx={{ textTransform: "uppercase", color: "#000" }}>
                  {HEADING_TEXT}
               </Heading>
               <Box>
                  <IconButton
                     color="inherit"
                     sx={styles.arrowIcon}
                     onClick={() => {
                        childRef?.current?.goPrev()
                     }}
                  >
                     <ArrowLeft fontSize={"large"} />
                  </IconButton>
                  <IconButton
                     color="inherit"
                     sx={styles.arrowIcon}
                     onClick={() => {
                        childRef?.current?.goNext()
                     }}
                  >
                     <ArrowRight fontSize={"large"} />
                  </IconButton>
               </Box>
            </Box>
            <SparksCarousel
               ref={childRef}
               sparks={sparksContent}
               onSparkClick={handleSparksClicked}
               isAdmin={false}
            />
         </Stack>
      </Box>
   ) : null
}

export default SparksCarouselWithSuspenseComponent
