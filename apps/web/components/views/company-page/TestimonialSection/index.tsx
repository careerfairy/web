import { Box, IconButton, Typography } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { SectionAnchor, TabValue, useCompanyPage } from "../index"
import { useCallback, useEffect, useMemo, useState } from "react"
import Add from "@mui/icons-material/Add"
import TestimonialCard from "./TestimonialCard"
import EditDialog from "../EditDialog"
import TestimonialDialog from "./TestimonialDialog"
import { Testimonial } from "@careerfairy/shared-lib/groups"
import { ArrowLeft, ArrowRight } from "react-feather"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import { useMountedState } from "react-use"
import useEmblaCarousel, {
   EmblaCarouselType,
   EmblaOptionsType,
} from "embla-carousel-react"
import React from "react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { ChildRefType } from "components/views/portal/events-preview/EventsPreviewCarousel"

// Not used for now, but can be used for custom styling on drag
const wheelGesturesOptions = {
   wheelDraggingClass: "is-wheel-dragging",
}
const slideSpacing = 21
const desktopSlideWidth = 550 + slideSpacing
const mobileSlideWidth = 321 + slideSpacing

// TODO: Clear properties unused
const styles = sxStyles({
   titleSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   arrowIcon: {
      padding: 0,
      minHeight: { xs: "25px", md: "30px" },
      minWidth: { xs: "25px", md: "30px" },
      ml: 2,
   },
   eventsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      px: 2,
   },
   seeMoreText: {
      color: "text.secondary",
      fontSize: "1.2rem",
      fontWeight: 600,
   },

   viewport: {
      overflow: "hidden",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
   },
   slide: {
      flex: {
         xs: `0 0 ${mobileSlideWidth}px`,
         md: `0 0 ${desktopSlideWidth}px`,
      },
      minWidth: 0,
      position: "relative",
      height: {
         xs: 405,
         md: 375,
      },
      paddingLeft: `calc(${slideSpacing}px - 5px)`,
   },
   paddingSlide: {
      flex: `0 0 ${slideSpacing}px`,
   },
   previewContent: {
      position: "relative",
   },
})

const TestimonialSection = React.forwardRef<ChildRefType, TestimonialProps>(
   (props, ref) => {
      const {
         group,
         editMode,
         sectionRefs: { testimonialSectionRef },
      } = useCompanyPage()
      const [testimonialToEdit, setTestimonialToEdit] = useState(null)
      const [step, setStep] = useState(0)
      const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
         useDialogStateHandler()

      const isMounted = useMountedState()

      useEffect(() => {
         setStep(0)
      }, [group?.testimonials])

      const handleCloseDialogClick = useCallback(() => {
         handleCloseDialog()
         setTestimonialToEdit(null)
      }, [handleCloseDialog])

      const handleEditTestimonial = useCallback(
         (selectedTestimonial: Testimonial) => {
            setTestimonialToEdit(selectedTestimonial)
            handleOpenDialog()
         },
         [handleOpenDialog]
      )

      const handleSteps = useCallback(
         (increment = false) => {
            if (increment) {
               setStep((prevStep) => (prevStep + 1) % group.testimonials.length)
            } else {
               if (step) {
                  setStep((prevStep) => prevStep - 1)
               } else {
                  setStep(group.testimonials.length - 1)
               }
            }
         },
         [group?.testimonials?.length, step]
      )
      const testimonialsCarouselEmblaOptions = useMemo<EmblaOptionsType>(
         () => ({
            axis: "x",
            loop: false,
            align: "center",
            dragThreshold: 0.5,
            dragFree: true,
            inViewThreshold: 0,
         }),
         []
      )

      const handleCardsLoaded = (cardsIndexLoaded: number[]) => {
         setCardsLoaded((prev) => ({
            ...prev,
            ...cardsIndexLoaded.reduce(
               (acc, curr) => ({ ...acc, [curr]: true }),
               {}
            ),
         }))
      }
      const [emblaRef, emblaApi] = useEmblaCarousel(
         testimonialsCarouselEmblaOptions,
         [WheelGesturesPlugin(wheelGesturesOptions)]
      )

      React.useImperativeHandle(ref, () => ({
         goNext() {
            emblaApi.scrollNext()
         },
         goPrev() {
            emblaApi.scrollPrev()
         },
      }))

      const [cardsLoaded, setCardsLoaded] = useState({})

      const [slidesInView, setSlidesInView] = useState<number[]>([])

      /**
       * Lazily load cards based on what is currently in view.
       * The @function handleCardsLoaded then updates the items array based on the indexes which are
       * currently in view.
       */
      const updateSlidesInView = useCallback(
         (emblaApi: EmblaCarouselType) => {
            setSlidesInView((slidesInView) => {
               if (slidesInView.length === emblaApi.slideNodes().length) {
                  emblaApi.off("slidesInView", updateSlidesInView)
               }
               const inView = emblaApi
                  .slidesInView()
                  .filter((index) => !slidesInView.includes(index))

               handleCardsLoaded(inView)

               return slidesInView.concat(inView)
            })
         },
         [setSlidesInView]
      )

      useEffect(() => {
         if (!emblaApi) return

         updateSlidesInView(emblaApi)
         emblaApi.on("slidesInView", updateSlidesInView)
         emblaApi.on("reInit", updateSlidesInView)
      }, [emblaApi, updateSlidesInView])

      if (!group?.testimonials?.length && !editMode) {
         return null
      }

      return isMounted() ? (
         <>
            <Box position={"relative"}>
               <SectionAnchor
                  ref={testimonialSectionRef}
                  tabValue={TabValue.testimonials}
               />
               <Box sx={styles.titleSection}>
                  <Typography variant="h4" fontWeight={"600"} color="black">
                     Testimonial
                  </Typography>
                  {editMode ? (
                     <IconButton
                        data-testid={"testimonial-section-edit-button"}
                        color="secondary"
                        onClick={handleOpenDialog}
                     >
                        <Add fontSize={"large"} />
                     </IconButton>
                  ) : (
                     <>
                        {group?.testimonials?.length > 1 ? (
                           <Box>
                              <IconButton
                                 color="inherit"
                                 sx={styles.arrowIcon}
                                 onClick={() => {
                                    handleSteps()
                                 }}
                              >
                                 <ArrowLeft fontSize={"large"} />
                              </IconButton>
                              <IconButton
                                 color="inherit"
                                 sx={styles.arrowIcon}
                                 onClick={() => {
                                    handleSteps(true)
                                 }}
                              >
                                 <ArrowRight fontSize={"large"} />
                              </IconButton>
                           </Box>
                        ) : null}
                     </>
                  )}
               </Box>

               <Box mt={2}>
                  {group?.testimonials?.length > 0 ? (
                     <Box sx={styles.viewport} ref={emblaRef}>
                        <Box sx={styles.container}>
                           <Box sx={styles.slide} key={"testimonial-slide-box"}>
                              {editMode ? (
                                 <>
                                    {group.testimonials.map(
                                       (testimonial, index) => (
                                          <TestimonialCard
                                             key={testimonial.id}
                                             testimonial={testimonial}
                                             handleEditTestimonial={
                                                handleEditTestimonial
                                             }
                                          />
                                       )
                                    )}
                                 </>
                              ) : (
                                 <>
                                    {group?.testimonials?.[step] ? (
                                       <TestimonialCard
                                          key={group.testimonials[step].id}
                                          testimonial={group.testimonials[step]}
                                          handleEditTestimonial={
                                             handleEditTestimonial
                                          }
                                       />
                                    ) : null}
                                 </>
                              )}
                           </Box>
                        </Box>
                     </Box>
                  ) : (
                     <Typography
                        variant="h6"
                        fontWeight={"400"}
                        color="textSecondary"
                     >
                        This section will not be shown to users until at least
                        one employee personal story has been added.
                     </Typography>
                  )}
               </Box>
            </Box>

            {isDialogOpen ? (
               <EditDialog
                  open={isDialogOpen}
                  title={"Testimonials"}
                  handleClose={handleCloseDialogClick}
               >
                  <TestimonialDialog
                     handleClose={handleCloseDialog}
                     testimonialToEdit={testimonialToEdit}
                  />
               </EditDialog>
            ) : null}
         </>
      ) : null
   }
)

export interface TestimonialProps {}
TestimonialSection.displayName = "TestimonialSection"
export default TestimonialSection
