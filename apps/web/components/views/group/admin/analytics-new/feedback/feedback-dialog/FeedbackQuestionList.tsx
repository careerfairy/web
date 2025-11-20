import { Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import useIsMobile from "components/custom-hook/useIsMobile"
import { GenericCarousel } from "components/views/common/carousels/GenericCarousel"
import useEmblaCarousel from "embla-carousel-react"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { useFeedbackDialogContext } from "./FeedbackDialog"
import { FeedbackQuestionCard } from "./FeedbackQuestionCard"
import { MobileFeedbackQuestionCard } from "./MobileFeedbackQuestionCard"

const styles = sxStyles({
   container: {
      width: "100%",
   },
   mobileContainer: {
      width: "100%",
      overflow: "hidden",
   },
})

export const FeedbackQuestionList = () => {
   const { allFeedbackQuestions, selectedFeedbackQuestion } =
      useFeedbackDialogContext()
   const isMobile = useIsMobile()
   const [emblaRef, emblaApi] = useEmblaCarousel({
      align: "start",
      dragFree: true,
      containScroll: "trimSnaps",
   })

   const filteredFeedbackQuestions = allFeedbackQuestions.filter(
      (question) => question.id !== selectedFeedbackQuestion.id
   )

   if (filteredFeedbackQuestions.length === 0) return null

   return (
      <Stack spacing={2} sx={styles.container}>
         <Typography variant="brandedH5" color="text.primary">
            Other feedback questions
         </Typography>

         {isMobile ? (
            <GenericCarousel
               emblaRef={emblaRef}
               emblaApi={emblaApi}
               gap="8px"
               sx={styles.mobileContainer}
               preventEdgeTouch
            >
               {filteredFeedbackQuestions.map((question) => (
                  <GenericCarousel.Slide key={question.id} slideWidth="224px">
                     <MobileFeedbackQuestionCard question={question} />
                  </GenericCarousel.Slide>
               ))}
            </GenericCarousel>
         ) : (
            <Stack spacing={1.5}>
               {filteredFeedbackQuestions.map((question) => (
                  <FeedbackQuestionCard key={question.id} question={question} />
               ))}
            </Stack>
         )}
      </Stack>
   )
}
