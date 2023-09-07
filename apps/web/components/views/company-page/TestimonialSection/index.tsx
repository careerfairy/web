import { Box, IconButton, Typography } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { SectionAnchor, TabValue, useCompanyPage } from "../index"
import { useCallback, useEffect, useState } from "react"
import Add from "@mui/icons-material/Add"
import TestimonialCard from "./TestimonialCard"
import EditDialog from "../EditDialog"
import TestimonialDialog from "./TestimonialDialog"
import { Testimonial } from "@careerfairy/shared-lib/groups"
import { ArrowLeft, ArrowRight } from "react-feather"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import { useMountedState } from "react-use"

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
})

const TestimonialSection = () => {
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

   if (!group?.testimonials?.length && !editMode) {
      return null
   }

   return isMounted() ? (
      <>
         <Box position={"relative"}>
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
                  <>
                     {editMode ? (
                        <>
                           {group.testimonials.map((testimonial) => (
                              <TestimonialCard
                                 key={testimonial.id}
                                 testimonial={testimonial}
                                 handleEditTestimonial={handleEditTestimonial}
                              />
                           ))}
                        </>
                     ) : (
                        <>
                           {group?.testimonials?.[step] ? (
                              <TestimonialCard
                                 key={group.testimonials[step].id}
                                 testimonial={group.testimonials[step]}
                                 handleEditTestimonial={handleEditTestimonial}
                              />
                           ) : null}
                        </>
                     )}
                  </>
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

export default TestimonialSection
