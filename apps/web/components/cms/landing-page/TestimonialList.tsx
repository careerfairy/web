import { HygraphResponseTestimonialListValue } from "../../../types/cmsTypes"
import Box from "@mui/material/Box"
import TestimonialsSection from "components/views/landing/TestimonialsSection"
import ThemedRichTextRenderer from "../ThemedRichTextRenderer"
import React from "react"
import { sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
   title: {
      marginX: { xs: 2, lg: 24, xl: 52 },
      textAlign: "center",
      "& :first-of-type": {
         fontWeight: 500,
      },
   },
   wrapper: {
      paddingLeft: 2,
      paddingRight: 4,
      paddingTop: 12,
   },
})

const TestimonialList = ({
   testimonials,
   sliderArrowColor,
   testimonialTitle,
}: HygraphResponseTestimonialListValue): JSX.Element => {
   return (
      <Box sx={styles.wrapper}>
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
