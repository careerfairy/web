import { Testimonial } from "@careerfairy/shared-lib/groups"
import Add from "@mui/icons-material/Add"
import { Box, IconButton, Typography } from "@mui/material"
import { GenericCarousel } from "components/views/common/carousels/GenericCarousel"
import { ChildRefType } from "components/views/portal/events-preview/EventsPreviewCarousel"
import AutoHeight from "embla-carousel-auto-height"
import useEmblaCarousel, {
   EmblaOptionsType,
   EmblaPluginType,
} from "embla-carousel-react"
import React, { useCallback, useMemo, useState } from "react"
import { useMountedState } from "react-use"
import { sxStyles } from "../../../../types/commonTypes"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import EditDialog from "../EditDialog"
import { useCompanyPage } from "../index"
import TestimonialCard from "./TestimonialCard"
import TestimonialDialog from "./TestimonialDialog"

const styles = sxStyles({
   titleSection: {
      mt: "24px !important",
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
      mr: 2,
   },
})

const TestimonialSection = React.forwardRef<ChildRefType>((_, ref) => {
   const { group, editMode } = useCompanyPage()
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
         <Box sx={styles.titleSection}>
            <Typography
               variant="brandedH3"
               fontWeight={"600"}
               color="neutral.900"
            >
               Testimonials
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
                  <GenericCarousel.Arrows emblaApi={emblaApi} />
               ) : null}
            </>
         </Box>

         <Box mt={"16px !important"}>
            {group?.testimonials?.length > 0 ? (
               <Box sx={styles.viewport} ref={emblaRef}>
                  <Box sx={styles.container}>
                     <>
                        {group?.testimonials?.map((testimonial) => (
                           <Box
                              sx={styles.slide}
                              key={"testimonial-slide-box-" + testimonial.id}
                           >
                              <TestimonialCard
                                 key={testimonial.id}
                                 testimonial={testimonial}
                                 handleEditTestimonial={handleEditTestimonial}
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
                  This section will not be shown to users until at least one
                  employee personal story has been added.
               </Typography>
            )}
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
})
TestimonialSection.displayName = "TestimonialSection"
export default TestimonialSection
