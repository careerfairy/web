import { Box, IconButton, Typography } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { SectionAnchor, TabValue, useCompanyPage } from "../index"
import { useCallback, useMemo, useRef, useState } from "react"
import Add from "@mui/icons-material/Add"
import TestimonialCard from "./TestimonialCard"
import EditDialog from "../EditDialog"
import TestimonialDialog from "./TestimonialDialog"
import { Testimonial } from "@careerfairy/shared-lib/groups"
import { ArrowLeft, ArrowRight } from "react-feather"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import { useMountedState } from "react-use"
import useEmblaCarousel, {
   EmblaOptionsType,
   EmblaPluginType,
} from "embla-carousel-react"
import React from "react"
import { ChildRefType } from "components/views/portal/events-preview/EventsPreviewCarousel"
import AutoHeight from "embla-carousel-auto-height"

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
   viewport: {
      overflow: "hidden",
      height: "auto",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
      alignItems: "flex-start",
   },
   slide: {
      flex: "0 0 100%",
      "&:not(:first-of-type)": {
         paddingX: 2,
      },
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

      const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
         useDialogStateHandler()

      const isMounted = useMountedState()

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

      const testimonialsCarouselEmblaOptions = useMemo<EmblaOptionsType>(
         () => ({
            axis: "x",
         }),
         []
      )

      const [emblaRef, emblaApi] = useEmblaCarousel(
         testimonialsCarouselEmblaOptions,
         /**
          * Mapping array with the autoheight, as using the Array directly gives a casting error.
          * Even though the heights are dynamically set for the container (even with error).
          */
         [AutoHeight() as unknown as EmblaPluginType]
      )

      React.useImperativeHandle(ref, () => ({
         goNext() {
            emblaApi.scrollNext()
         },
         goPrev() {
            emblaApi.scrollPrev()
         },
      }))

      if (!group?.testimonials?.length && !editMode) {
         return null
      }

      return isMounted() ? (
         <>
            <Box position="relative">
               <SectionAnchor
                  ref={testimonialSectionRef}
                  tabValue={TabValue.testimonials}
               />
               <Box sx={styles.titleSection}>
                  <Typography variant="h4" fontWeight={"600"} color="black">
                     Testimonial
                  </Typography>
                  <>
                     {editMode ? (
                        <IconButton
                           data-testid={"testimonial-section-edit-button"}
                           color="secondary"
                           onClick={handleOpenDialog}
                        >
                           <Add fontSize={"large"} />
                        </IconButton>
                     ) : (
                        <> </>
                     )}
                     {group?.testimonials?.length > 1 ? (
                        <Box>
                           <IconButton
                              color="inherit"
                              sx={styles.arrowIcon}
                              onClick={() => {
                                 if (emblaApi.canScrollPrev())
                                    emblaApi.scrollPrev()
                              }}
                           >
                              <ArrowLeft fontSize={"large"} />
                           </IconButton>
                           <IconButton
                              color="inherit"
                              sx={styles.arrowIcon}
                              onClick={() => {
                                 if (emblaApi.canScrollNext())
                                    emblaApi.scrollNext()
                              }}
                           >
                              <ArrowRight fontSize={"large"} />
                           </IconButton>
                        </Box>
                     ) : null}
                  </>
               </Box>

               <Box mt={1}>
                  {group?.testimonials?.length > 0 ? (
                     <Box sx={styles.viewport} ref={emblaRef}>
                        <Box sx={styles.container}>
                           <>
                              {group?.testimonials?.map((testimonial) => (
                                 <Box
                                    sx={styles.slide}
                                    key={
                                       "testimonial-slide-box-" + testimonial.id
                                    }
                                 >
                                    <TestimonialCard
                                       key={testimonial.id}
                                       testimonial={testimonial}
                                       handleEditTestimonial={
                                          handleEditTestimonial
                                       }
                                    />
                                 </Box>
                              ))}
                           </>
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
