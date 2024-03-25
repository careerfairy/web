import { Box, IconButton, Stack, SxProps, Theme } from "@mui/material"
import { FC, ReactNode, useEffect, useRef, useState } from "react"
import SparksCarousel, {
   ChildRefType,
} from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import SparksCarouselSkeleton from "components/views/admin/sparks/general-sparks-view/SparksCarouselSkeleton"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useSparks from "components/custom-hook/spark/useSparks"
import { ArrowLeft, ArrowRight } from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"
import { EmblaOptionsType } from "embla-carousel-react"

const styles = sxStyles({
   stack: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
   },
   arrowIcon: {
      padding: 0,
      minHeight: { xs: "25px", md: "30px" },
      minWidth: { xs: "25px", md: "30px" },
      ml: 2,
   },
   sparksContentPaddingLeft: 2,
   defaultSparks: {
      pl: 2,
   },
})

type Props = {
   header: ReactNode
   groupId?: string
   handleSparksClicked: (spark: Spark) => void
   sx?: SxProps<Theme>
}
type FallbackComponentProps = {
   header: ReactNode
}

const sparksCarouselEmblaOptions: EmblaOptionsType = {
   loop: false,
   skipSnaps: true,
}
const SparksCarouselWithSuspenseComponent: FC<Props> = ({
   header,
   groupId,
   handleSparksClicked,
   sx,
}) => {
   const [isClient, setIsClient] = useState(false)
   useEffect(() => {
      // The useEffect hook only runs on the client
      setIsClient(true)
   }, [])

   return isClient ? (
      <SuspenseWithBoundary fallback={<FallbackComponent header={header} />}>
         <Component
            header={header}
            groupId={groupId}
            handleSparksClicked={handleSparksClicked}
            sx={sx}
         />
      </SuspenseWithBoundary>
   ) : (
      <SparksCarouselSkeleton numSlides={8} />
   )
}

const FallbackComponent: FC<FallbackComponentProps> = ({ header }) => {
   return (
      <Box>
         <Stack direction={"column"} sx={{ gap: "10px" }}>
            {header}
            <SparksCarouselSkeleton numSlides={8} />
         </Stack>
      </Box>
   )
}

const Component: FC<Props> = ({ header, groupId, handleSparksClicked, sx }) => {
   const { data: sparksContent } = useSparks(8, groupId)
   const childRef = useRef<ChildRefType | null>(null)
   const withControls = Boolean(groupId)
   return sparksContent.length ? (
      <Box sx={combineStyles(styles.defaultSparks, sx)} id="test">
         <Stack spacing={1.25}>
            <Box sx={styles.stack}>
               {header}
               {withControls ? (
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
               ) : null}
            </Box>
            <SparksCarousel
               ref={childRef}
               sparks={sparksContent}
               onSparkClick={handleSparksClicked}
               isAdmin={false}
               options={sparksCarouselEmblaOptions}
            />
         </Stack>
      </Box>
   ) : null
}

export default SparksCarouselWithSuspenseComponent
