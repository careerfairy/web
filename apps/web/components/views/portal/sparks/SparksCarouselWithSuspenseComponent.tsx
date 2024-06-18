import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Box, IconButton, Stack, SxProps, Theme } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useSparks from "components/custom-hook/spark/useSparks"
import { useUserSparks } from "components/custom-hook/spark/useUserSparks"
import SparksCarousel, {
   ChildRefType,
} from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import { EmblaOptionsType } from "embla-carousel-react"
import { ComponentType, FC, ReactNode, useRef } from "react"
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"
import { FallbackComponent } from "./FallbackComponent"

const styles = sxStyles({
   stack: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "stretch",
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
   buttonsWrapper: {
      display: "flex",
   },
   noPadding: {
      p: 0,
   },
})

type Props = {
   header: ReactNode
   groupId?: string
   handleSparksClicked: (spark: Spark) => void
   sx?: SxProps<Theme>
   headerSx?: SxProps<Theme>
   showArrows?: boolean
   /**
    * The sliding arrows component to show if showArrows is true.
    */
   arrows?: ComponentType<ArrowsProps>
}

const sparksCarouselEmblaOptions: EmblaOptionsType = {
   loop: false,
   skipSnaps: true,
}
const SparksCarouselWithSuspenseComponent: FC<Props> = ({
   header,
   groupId,
   handleSparksClicked,
   showArrows = false,
   arrows,
   sx,
   headerSx,
}) => {
   return (
      <SuspenseWithBoundary fallback={<FallbackComponent header={header} />}>
         <Component
            header={header}
            groupId={groupId}
            handleSparksClicked={handleSparksClicked}
            showArrows={showArrows}
            arrows={arrows}
            sx={sx}
            headerSx={headerSx}
         />
      </SuspenseWithBoundary>
   )
}

const Component: FC<Props> = ({
   header,
   groupId,
   handleSparksClicked,
   showArrows,
   arrows: Arrows,
   sx,
   headerSx,
}) => {
   const shouldFetchGroupSparks = Boolean(groupId)
   const { authenticatedUser } = useAuth()

   const { data: groupSparks } = useSparks({
      totalItems: 8,
      groupId,
      disabled: !shouldFetchGroupSparks,
   })

   const { data: userSparks } = useUserSparks({
      disabled: shouldFetchGroupSparks,
   })

   const sparksContent = shouldFetchGroupSparks ? groupSparks : userSparks

   const childRef = useRef<ChildRefType | null>(null)

   const onClickPrev = () => {
      childRef?.current?.goPrev()
   }
   const onClickNext = () => {
      childRef?.current?.goNext()
   }

   if (!authenticatedUser.isLoaded) return <FallbackComponent header={header} />

   if (!sparksContent) return null

   return (
      <Box sx={combineStyles(styles.defaultSparks, sx)}>
         <Stack spacing={1.25}>
            <Box sx={combineStyles(styles.stack, headerSx)}>
               {header}
               {showArrows ? (
                  Arrows ? (
                     <Arrows
                        onClickPrev={onClickPrev}
                        onClickNext={onClickNext}
                     />
                  ) : (
                     <DefaultArrows
                        onClickPrev={onClickPrev}
                        onClickNext={onClickNext}
                     />
                  )
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
   )
}

type ArrowsProps = {
   onClickPrev: () => void
   onClickNext: () => void
}

const DefaultArrows: FC<ArrowsProps> = ({ onClickPrev, onClickNext }) => {
   return (
      <Box>
         <IconButton
            color="inherit"
            sx={styles.arrowIcon}
            onClick={onClickPrev}
         >
            <ArrowLeft fontSize={"large"} />
         </IconButton>
         <IconButton
            color="inherit"
            sx={styles.arrowIcon}
            onClick={onClickNext}
         >
            <ArrowRight fontSize={"large"} />
         </IconButton>
      </Box>
   )
}

export const MobileSparksArrows: FC<ArrowsProps> = ({
   onClickPrev,
   onClickNext,
}) => {
   return (
      <Box sx={styles.buttonsWrapper} gap={1.2}>
         <IconButton
            sx={styles.noPadding}
            color="inherit"
            onClick={onClickPrev}
         >
            <ChevronLeft fontSize={"large"} />
         </IconButton>
         <IconButton
            sx={styles.noPadding}
            color="inherit"
            onClick={onClickNext}
         >
            <ChevronRight fontSize={"large"} />
         </IconButton>
      </Box>
   )
}

export default SparksCarouselWithSuspenseComponent
