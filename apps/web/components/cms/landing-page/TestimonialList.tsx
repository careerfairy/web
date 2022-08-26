import { HygraphResponseTestimonialListValue } from "../../../types/cmsTypes"
import Box from "@mui/material/Box"
import TestimonialsSection from "components/views/landing/TestimonialsSection"
import ThemedRichTextRenderer from "../ThemedRichTextRenderer"
import React from "react"
import { sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
   title: {
      marginX: { xs: 2, lg: 12, xl: 42 },
      textAlign: "center",
      marginBottom: -4,
   },
})

const TestimonialList = ({
   testimonials,
   sliderArrowColor,
   testimonialTitle,
}: HygraphResponseTestimonialListValue): JSX.Element => {
   return (
      <Box paddingX={2} paddingTop={12}>
         {testimonialTitle && (
            <Box sx={styles.title}>
               <ThemedRichTextRenderer rawContent={testimonialTitle.raw} />
            </Box>
         )}
         <TestimonialsSection
            testimonials={testimonials}
            sliderArrowColor={sliderArrowColor}
         />
      </Box>
   )
}

export default TestimonialList
