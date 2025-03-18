import { Box, Grid } from "@mui/material"
import { useCompanyPage } from ".."
import TestimonialCard from "../TestimonialSection/TestimonialCard"

const TestimonialsTab = () => {
   const { group } = useCompanyPage()

   const testimonials = group?.testimonials

   // if (!testimonials) return <EmptyItemsView />
   return (
      <Box>
         <Grid container spacing={2}>
            {testimonials?.map((testimonial) => (
               <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  xl={4}
                  key={testimonial.id}
               >
                  <TestimonialCard
                     testimonial={testimonial}
                     handleEditTestimonial={() => {}}
                  />
               </Grid>
            ))}
         </Grid>
      </Box>
   )
}

export default TestimonialsTab
