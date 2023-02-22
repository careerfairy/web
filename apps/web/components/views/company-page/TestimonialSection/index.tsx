import { Box, Button, Typography } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { useCompanyPage } from "../index"
import { useCallback, useState } from "react"
import { Add } from "@mui/icons-material"
import TestimonialCard from "./TestimonialCard"
import EditDialog from "../EditDialog"
import TestimonialDialog from "./TestimonialDialog"
import { Testimonial } from "@careerfairy/shared-lib/groups"

const styles = sxStyles({
   titleSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
})

const TestimonialSection = () => {
   const { group, editMode } = useCompanyPage()
   const [openDialog, setOpenDialog] = useState(false)
   const [testimonialToEdit, setTestimonialToEdit] = useState(null)

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
               ) : null}
            </Box>

            <Box mt={2}>
               {group?.testimonials?.length > 0 ? (
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
