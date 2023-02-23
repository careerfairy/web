import { Box, Button, Typography } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { useCompanyPage } from "../index"
import { useCallback, useState } from "react"
import { Add } from "@mui/icons-material"
import TestimonialCard from "./TestimonialCard"
import EditDialog from "../EditDialog"
import TestimonialDialog from "./TestimonialDialog"
import { Testimonial } from "@careerfairy/shared-lib/groups"
import { ArrowLeft, ArrowRight } from "react-feather"

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
   const { group, editMode } = useCompanyPage()
   const [openDialog, setOpenDialog] = useState(false)
   const [testimonialToEdit, setTestimonialToEdit] = useState(null)
   const [step, setStep] = useState(0)

   const handleCloseDialog = useCallback(() => {
      setOpenDialog(false)
      setTestimonialToEdit(null)
   }, [])

   const handleEditTestimonial = useCallback(
      (selectedTestimonial: Testimonial) => {
         setTestimonialToEdit(selectedTestimonial)
         setOpenDialog(true)
      },
      []
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

   if (!group?.testimonials && !editMode) {
      return null
   }

   return (
      <>
         <Box>
            <Box sx={styles.titleSection}>
               <Typography variant="h4" fontWeight={"600"} color="black">
                  Testimonial
               </Typography>
               {editMode ? (
                  <Button
                     variant="text"
                     color="secondary"
                     onClick={() => {
                        setOpenDialog(true)
                     }}
                  >
                     <Add fontSize={"large"} />
                  </Button>
               ) : (
                  <Box>
                     <Button
                        variant="text"
                        color="inherit"
                        sx={styles.arrowIcon}
                        onClick={() => {
                           handleSteps()
                        }}
                     >
                        <ArrowLeft fontSize={"large"} />
                     </Button>
                     <Button
                        variant="text"
                        color="inherit"
                        sx={styles.arrowIcon}
                        onClick={() => {
                           handleSteps(true)
                        }}
                     >
                        <ArrowRight fontSize={"large"} />
                     </Button>
                  </Box>
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
                        <TestimonialCard
                           key={group.testimonials[step].id}
                           testimonial={group.testimonials[step]}
                           handleEditTestimonial={handleEditTestimonial}
                        />
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

         <EditDialog
            open={openDialog}
            title={"Testimonials"}
            handleClose={handleCloseDialog}
         >
            <TestimonialDialog
               handleClose={handleCloseDialog}
               testimonialToEdit={testimonialToEdit}
            />
         </EditDialog>
      </>
   )
}

export default TestimonialSection
