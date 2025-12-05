import { Stack, Typography } from "@mui/material"
import { useAllLivestreamPolls } from "components/custom-hook/streaming/useAllLivestreamPolls"
import { GenericCarousel } from "components/views/common/carousels/GenericCarousel"
import useEmblaCarousel from "embla-carousel-react"
import { Fragment } from "react"
import { sxStyles } from "types/commonTypes"
import { PollResultCard, PollResultCardSkeleton } from "./PollResultCard"

const styles = sxStyles({
   section: {
      pl: { xs: 1.5, md: 4 },
   },
})

type PollsSectionProps = {
   livestreamId: string | null
}

export const PollsSection = ({ livestreamId }: PollsSectionProps) => {
   const { data: polls = [], isLoading } = useAllLivestreamPolls(livestreamId)

   const [emblaRef, emblaApi] = useEmblaCarousel({
      align: "start",
      containScroll: "trimSnaps",
   })

   // Don't render section if no polls and not loading
   if (!isLoading && (!polls || polls.length === 0)) {
      return null
   }

   return (
      <Stack spacing={2} pb={3}>
         <Typography
            sx={styles.section}
            variant="brandedH5"
            fontWeight={600}
            color="neutral.800"
         >
            Polls during live stream
         </Typography>
         <GenericCarousel
            sx={styles.section}
            emblaRef={emblaRef}
            emblaApi={emblaApi}
            gap="15px"
            preventEdgeTouch
         >
            {isLoading ? (
               <PollsLoader />
            ) : (
               polls.map((poll) => (
                  <GenericCarousel.Slide key={poll.id} slideWidth="335px">
                     <PollResultCard poll={poll} />
                  </GenericCarousel.Slide>
               ))
            )}
         </GenericCarousel>
      </Stack>
   )
}

const skeletons = Array.from({ length: 2 }).map((_, index) => (
   <PollResultCardSkeleton key={index} />
))

const PollsLoader = () => {
   return (
      <Fragment>
         {skeletons.map((skeleton, index) => (
            <GenericCarousel.Slide key={index} slideWidth="335px">
               {skeleton}
            </GenericCarousel.Slide>
         ))}
      </Fragment>
   )
}
